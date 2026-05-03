-- 참나눔회 웹사이트 데이터베이스 스키마
-- Supabase SQL 에디터에서 한 번만 실행하세요.

-- 1. 프로필 (auth.users 와 1:1)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

-- 회원가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 관리자 여부 확인용 함수 (RLS 무한재귀 방지)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = uid),
    false
  );
$$;

-- 2. 공지사항
create table if not exists public.announcements (
  id bigserial primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 3. 일정
create table if not exists public.schedules (
  id bigserial primary key,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 4. Q&A 게시판
create table if not exists public.qna_questions (
  id bigserial primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.qna_answers (
  id bigserial primary key,
  question_id bigint not null references public.qna_questions(id) on delete cascade,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 5. 회원 게시판
create table if not exists public.member_posts (
  id bigserial primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.member_comments (
  id bigserial primary key,
  post_id bigint not null references public.member_posts(id) on delete cascade,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ===========================================
-- RLS 정책
-- ===========================================
alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.schedules enable row level security;
alter table public.qna_questions enable row level security;
alter table public.qna_answers enable row level security;
alter table public.member_posts enable row level security;
alter table public.member_comments enable row level security;

-- profiles: 모두 읽기 가능, 본인만 수정, 관리자는 role 변경 가능
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- 공지사항: 모두 읽기, 관리자만 작성/수정/삭제
drop policy if exists "announcements read" on public.announcements;
create policy "announcements read" on public.announcements for select using (true);

drop policy if exists "announcements admin write" on public.announcements;
create policy "announcements admin write" on public.announcements
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- 일정: 모두 읽기, 관리자만 작성/수정/삭제
drop policy if exists "schedules read" on public.schedules;
create policy "schedules read" on public.schedules for select using (true);

drop policy if exists "schedules admin write" on public.schedules;
create policy "schedules admin write" on public.schedules
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Q&A 질문: 모두 읽기, 로그인 사용자 작성, 본인 또는 관리자 수정/삭제
drop policy if exists "qna_q read" on public.qna_questions;
create policy "qna_q read" on public.qna_questions for select using (true);

drop policy if exists "qna_q insert" on public.qna_questions;
create policy "qna_q insert" on public.qna_questions
  for insert with check (auth.uid() = author_id);

drop policy if exists "qna_q update" on public.qna_questions;
create policy "qna_q update" on public.qna_questions
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "qna_q delete" on public.qna_questions;
create policy "qna_q delete" on public.qna_questions
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- Q&A 답변: 동일
drop policy if exists "qna_a read" on public.qna_answers;
create policy "qna_a read" on public.qna_answers for select using (true);

drop policy if exists "qna_a insert" on public.qna_answers;
create policy "qna_a insert" on public.qna_answers
  for insert with check (auth.uid() = author_id);

drop policy if exists "qna_a update" on public.qna_answers;
create policy "qna_a update" on public.qna_answers
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "qna_a delete" on public.qna_answers;
create policy "qna_a delete" on public.qna_answers
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- 회원 게시판: 로그인한 회원만 읽기/작성, 본인 또는 관리자 수정/삭제
drop policy if exists "member_posts read" on public.member_posts;
create policy "member_posts read" on public.member_posts
  for select using (auth.uid() is not null);

drop policy if exists "member_posts insert" on public.member_posts;
create policy "member_posts insert" on public.member_posts
  for insert with check (auth.uid() = author_id);

drop policy if exists "member_posts update" on public.member_posts;
create policy "member_posts update" on public.member_posts
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "member_posts delete" on public.member_posts;
create policy "member_posts delete" on public.member_posts
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- 회원 댓글: 동일
drop policy if exists "member_comments read" on public.member_comments;
create policy "member_comments read" on public.member_comments
  for select using (auth.uid() is not null);

drop policy if exists "member_comments insert" on public.member_comments;
create policy "member_comments insert" on public.member_comments
  for insert with check (auth.uid() = author_id);

drop policy if exists "member_comments update" on public.member_comments;
create policy "member_comments update" on public.member_comments
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "member_comments delete" on public.member_comments;
create policy "member_comments delete" on public.member_comments
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- ===========================================
-- 동적 페이지/메뉴 시스템 (migrations/01_pages.sql 와 동일)
-- ===========================================
create table if not exists public.pages (
  id bigserial primary key,
  parent_id bigint references public.pages(id) on delete cascade,
  slug text not null,
  title text not null,
  content text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists pages_parent_slug_unique
  on public.pages (coalesce(parent_id, 0), slug);

create index if not exists pages_parent_idx on public.pages(parent_id);
create index if not exists pages_sort_idx on public.pages(parent_id, sort_order);

alter table public.pages enable row level security;

drop policy if exists "pages read published" on public.pages;
create policy "pages read published" on public.pages
  for select using (is_published = true or public.is_admin(auth.uid()));

drop policy if exists "pages admin all" on public.pages;
create policy "pages admin all" on public.pages
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create or replace function public.touch_pages_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists pages_touch_updated_at on public.pages;
create trigger pages_touch_updated_at
  before update on public.pages
  for each row execute function public.touch_pages_updated_at();

do $$
declare about_id bigint;
begin
  if not exists (select 1 from public.pages where slug = 'about' and parent_id is null) then
    insert into public.pages (slug, title, content, sort_order)
    values ('about', '기관소개', null, 10)
    returning id into about_id;

    insert into public.pages (parent_id, slug, title, content, sort_order) values
      (about_id, 'greeting', '인사말',
       E'안녕하세요. 참나눔회 회장 인사말입니다.\n\n(여기에 인사말 내용을 작성해주세요.)',
       10),
      (about_id, 'intro', '기관소개',
       E'참나눔회는 도움이 필요한 이웃과 함께하는 비영리 기부 단체입니다.\n\n(여기에 기관 소개 내용을 작성해주세요.)',
       20),
      (about_id, 'history', '연혁',
       E'참나눔회 연혁\n\n- 2020년 설립\n- (여기에 연혁을 작성해주세요)',
       30);
  end if;
end $$;

-- ===========================================
-- 메뉴 link_override + 정적 메뉴 시드 (migrations/02_menu_link_override.sql 와 동일)
-- ===========================================
alter table public.pages
  add column if not exists link_override text;

do $$
begin
  if not exists (select 1 from public.pages where slug = 'notice' and parent_id is null) then
    insert into public.pages (slug, title, link_override, sort_order)
    values ('notice', '공지사항', '/announcements', 20);
  end if;
  if not exists (select 1 from public.pages where slug = 'cal' and parent_id is null) then
    insert into public.pages (slug, title, link_override, sort_order)
    values ('cal', '일정', '/schedule', 30);
  end if;
  if not exists (select 1 from public.pages where slug = 'qa' and parent_id is null) then
    insert into public.pages (slug, title, link_override, sort_order)
    values ('qa', 'Q&A', '/qna', 40);
  end if;
  if not exists (select 1 from public.pages where slug = 'member-board' and parent_id is null) then
    insert into public.pages (slug, title, link_override, sort_order)
    values ('member-board', '회원게시판', '/members', 50);
  end if;
end $$;

-- ===========================================
-- Storage 버킷 + 사이트 설정 (migrations/03_storage_and_settings.sql 와 동일)
-- ===========================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "uploads public read" on storage.objects;
create policy "uploads public read" on storage.objects
  for select using (bucket_id = 'uploads');

drop policy if exists "uploads auth insert" on storage.objects;
create policy "uploads auth insert" on storage.objects
  for insert with check (bucket_id = 'uploads' and auth.uid() is not null);

drop policy if exists "uploads owner update" on storage.objects;
create policy "uploads owner update" on storage.objects
  for update using (bucket_id = 'uploads' and owner = auth.uid());

drop policy if exists "uploads owner or admin delete" on storage.objects;
create policy "uploads owner or admin delete" on storage.objects
  for delete using (
    bucket_id = 'uploads'
    and (owner = auth.uid() or public.is_admin(auth.uid()))
  );

create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings for select using (true);

drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create or replace function public.touch_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists settings_touch_updated_at on public.site_settings;
create trigger settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_settings_updated_at();

insert into public.site_settings (key, value) values
  ('home_hero_title', '함께 나누는 따뜻한 마음'),
  ('home_hero_subtitle',
   '참나눔회는 우리 사회의 소외된 이웃에게 사랑과 희망을 전하는 비영리 기부 단체입니다.'),
  ('home_hero_image_url', ''),
  ('home_body',
   E'## 우리의 가치\n\n참나눔회는 다음과 같은 가치를 추구합니다.\n\n- **나눔** — 정기 후원과 일회성 기부를 통해 도움이 필요한 곳에 따뜻함을 전합니다.\n- **봉사** — 지역사회와 함께하는 봉사 활동으로 직접 손을 내밀고 마음을 나눕니다.\n- **연대** — 회원들이 모여 작은 힘을 큰 변화로 만들어가는 따뜻한 공동체입니다.')
on conflict (key) do nothing;

