-- 메뉴 link_override + 기존 정적 메뉴를 DB 항목으로 시드
-- migration 01 이후에 SQL Editor 에서 실행하세요.

alter table public.pages
  add column if not exists link_override text;

-- 기존 정적 메뉴(공지사항/일정/Q&A/회원게시판)를 DB 항목으로 등록.
-- link_override 가 설정된 페이지는 헤더 클릭 시 해당 URL 로 이동하며,
-- 페이지 자체에 컨텐츠가 필요 없습니다 (메뉴 그룹 용도).
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
