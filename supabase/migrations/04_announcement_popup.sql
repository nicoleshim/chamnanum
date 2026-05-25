-- 공지사항 팝업 기능 추가
-- QK2-4: 공지사항 팝업 기능 추가

-- announcements 테이블에 팝업 관련 컬럼 추가
ALTER TABLE public.announcements 
  ADD COLUMN IF NOT EXISTS is_popup boolean NOT NULL DEFAULT false;

ALTER TABLE public.announcements 
  ADD COLUMN IF NOT EXISTS popup_start_date timestamptz;

ALTER TABLE public.announcements 
  ADD COLUMN IF NOT EXISTS popup_end_date timestamptz;

ALTER TABLE public.announcements 
  ADD COLUMN IF NOT EXISTS popup_display_count integer DEFAULT NULL;

-- 팝업 조회 성능을 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_announcements_is_popup 
  ON public.announcements(is_popup);

CREATE INDEX IF NOT EXISTS idx_announcements_popup_dates 
  ON public.announcements(is_popup, popup_start_date, popup_end_date) 
  WHERE is_popup = true;
