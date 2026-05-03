-- 동적 페이지/메뉴 시스템
-- 이미 schema.sql 을 한 번 실행하셨다면 이 파일을 SQL Editor 에서 실행하세요.

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

-- updated_at 자동 갱신
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

-- 시드 데이터: 기관소개 메뉴 + 3개 하위 페이지
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
