-- 첨부파일 저장소 + 사이트 설정 테이블
-- migration 02 이후 SQL Editor 에서 실행하세요.

-- ===========================================
-- Storage 버킷: uploads (공개 읽기, 인증 사용자 쓰기)
-- ===========================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "uploads public read" on storage.objects;
create policy "uploads public read" on storage.objects
  for select using (bucket_id = 'uploads');

drop policy if exists "uploads auth insert" on storage.objects;
create policy "uploads auth insert" on storage.objects
  for insert with check (
    bucket_id = 'uploads' and auth.uid() is not null
  );

drop policy if exists "uploads owner update" on storage.objects;
create policy "uploads owner update" on storage.objects
  for update using (
    bucket_id = 'uploads' and owner = auth.uid()
  );

drop policy if exists "uploads owner or admin delete" on storage.objects;
create policy "uploads owner or admin delete" on storage.objects
  for delete using (
    bucket_id = 'uploads'
    and (owner = auth.uid() or public.is_admin(auth.uid()))
  );

-- ===========================================
-- 사이트 설정 (key/value)
-- ===========================================
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings
  for select using (true);

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

-- 홈페이지 기본값
insert into public.site_settings (key, value) values
  ('home_hero_title', '함께 나누는 따뜻한 마음'),
  ('home_hero_subtitle',
   '참나눔회는 우리 사회의 소외된 이웃에게 사랑과 희망을 전하는 비영리 기부 단체입니다.'),
  ('home_hero_image_url', ''),
  ('home_body',
   E'## 우리의 가치\n\n참나눔회는 다음과 같은 가치를 추구합니다.\n\n- **나눔** — 정기 후원과 일회성 기부를 통해 도움이 필요한 곳에 따뜻함을 전합니다.\n- **봉사** — 지역사회와 함께하는 봉사 활동으로 직접 손을 내밀고 마음을 나눕니다.\n- **연대** — 회원들이 모여 작은 힘을 큰 변화로 만들어가는 따뜻한 공동체입니다.')
on conflict (key) do nothing;
