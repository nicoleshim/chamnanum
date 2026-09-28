-- 언론보도(참나눔회 관련 기사) 게시판

create table if not exists public.press_articles (
  id bigserial primary key,
  title text not null,
  source_name text not null,
  reporter text,
  published_date date,
  url text not null unique,
  summary text,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.press_articles enable row level security;

drop policy if exists "press_articles read" on public.press_articles;
create policy "press_articles read" on public.press_articles for select using (true);

drop policy if exists "press_articles admin write" on public.press_articles;
create policy "press_articles admin write" on public.press_articles
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- 기관소개(about) 하위 메뉴에 언론보도 링크 추가
do $$
declare about_id bigint;
begin
  select id into about_id from public.pages where slug = 'about' and parent_id is null;
  if about_id is not null
     and not exists (
       select 1 from public.pages where slug = 'press' and parent_id = about_id
     ) then
    insert into public.pages (parent_id, slug, title, link_override, sort_order)
    values (about_id, 'press', '언론보도', '/press', 40);
  end if;
end $$;

-- 실제 보도 기사 등록
insert into public.press_articles (title, source_name, reporter, published_date, url, summary)
values
  (
    '참나눔회, ''행복한 건강밥상'' 무료급식소 개소',
    '울산광역매일',
    '이세현 기자',
    '2026-03-24',
    'https://www.kyilbo.com/365976',
    E'봉사단체 참나눔회(회장 심필보)가 지역 취약계층을 위한 무료급식소 ''행복한 건강밥상''을 개소했다. 개소식에는 심필보 회장, 울산 아너 소사이어티 회원, 울산 사회복지공동모금회 양호영 사무처장 등이 참석했다.\n\n이 급식소는 지역 내 결식 우려가 있는 이웃들에게 따뜻한 식사를 제공하며 정서적 교류의 장으로 기능할 예정이다. 심필보 회장은 "작은 정성이지만 지역의 어려운 이웃들에게 따뜻한 한 끼를 전하고자 이번 급식소를 마련하게 됐다"고 밝혔다.'
  ),
  (
    '참나눔회 ''행복한 건강밥상'' 무료급식소 개소',
    '경상일보',
    '주하연 기자',
    '2026-03-25',
    'https://www.ksilbo.co.kr/news/articleView.html?idxno=1052178',
    E'봉사단체 참나눔회(회장 심필보)는 24일 지역 내 취약계층을 위한 무료급식소 ''행복한 건강밥상'' 개소식을 개최했다. 개소식에는 심필보 참나눔회 회장 및 울산 아너소사이어티 회원, 양호영 울산사회복지공동모금회 사무처장 등이 참석했다.'
  )
on conflict (url) do nothing;
