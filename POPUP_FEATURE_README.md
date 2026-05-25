# 공지사항 팝업 기능 구현 완료

## 개요
QK2-4 스펙에 따라 참나눔회 웹사이트에 공지사항 팝업 기능을 추가했습니다.

## 구현된 기능

### 1. 데이터베이스 스키마 변경
- **파일**: `supabase/migrations/04_announcement_popup.sql`
- **변경 내용**:
  - `announcements` 테이블에 4개의 새 컬럼 추가:
    - `is_popup`: 팝업 활성화 여부 (boolean)
    - `popup_start_date`: 팝업 시작 날짜 (timestamptz)
    - `popup_end_date`: 팝업 종료 날짜 (timestamptz)
    - `popup_display_count`: 팝업 표시 횟수 (integer, 향후 확장용)
  - 성능 최적화를 위한 인덱스 추가

### 2. 팝업 컴포넌트
- **파일**: `src/components/AnnouncementPopup.tsx`
- **기능**:
  - 공지사항을 모달 팝업으로 표시
  - "닫기" 버튼: 팝업을 숨김 (페이지 새로고침 시 재표시)
  - "다시 보지 않기" 버튼: localStorage에 상태 저장하여 영구적으로 숨김
  - 반응형 디자인 및 스크롤 가능한 콘텐츠

### 3. 공지사항 작성/수정 폼
- **파일**: `src/app/announcements/components/AnnouncementForm.tsx`
- **기능**:
  - 팝업 활성화 체크박스
  - 팝업 시작/종료 날짜 입력 필드
  - 조건부 UI (팝업 체크 시에만 날짜 필드 표시)
  - 작성 및 수정 모드 지원

### 4. 서버 액션 업데이트
- **파일**: `src/app/announcements/actions.ts`
- **변경 내용**:
  - `createAnnouncement`: 팝업 필드 저장 로직 추가
  - `updateAnnouncement`: 팝업 필드 업데이트 로직 추가 (신규)

### 5. 페이지 업데이트

#### 홈 페이지 (`src/app/page.tsx`)
- `getPopupAnnouncements()` 함수 추가:
  - 현재 시간 기준으로 활성화된 팝업 조회
  - 시작/종료 날짜 범위 필터링
  - 최신 1개만 표시
- `AnnouncementPopup` 컴포넌트 렌더링

#### 공지사항 작성 페이지 (`src/app/announcements/new/page.tsx`)
- `AnnouncementForm` 컴포넌트 사용

#### 공지사항 수정 페이지 (`src/app/announcements/[id]/edit/page.tsx`)
- 신규 생성
- 기존 데이터를 폼에 로드
- `AnnouncementForm` 컴포넌트 사용

#### 공지사항 상세 페이지 (`src/app/announcements/[id]/page.tsx`)
- "수정" 버튼 추가

## 사용 방법

### 데이터베이스 마이그레이션 적용
Supabase SQL 에디터에서 다음 파일을 실행:
```sql
-- supabase/migrations/04_announcement_popup.sql
```

### 팝업 공지사항 작성
1. 관리자로 로그인
2. 공지사항 작성 페이지로 이동
3. 제목과 내용 입력
4. "팝업으로 표시" 체크박스 선택
5. (선택) 팝업 시작/종료 날짜 설정
   - 비워두면 즉시 표시 / 무제한 표시
6. "작성" 버튼 클릭

### 팝업 동작
- 홈 페이지 방문 시 조건을 만족하는 팝업이 자동으로 표시됩니다
- 사용자는 "닫기" 또는 "다시 보지 않기"를 선택할 수 있습니다
- "다시 보지 않기" 선택 시 해당 공지사항은 더 이상 표시되지 않습니다

## 검증 기준 (Acceptance Criteria)

✅ AC-1: 팝업 표시 조건 만족 시 홈 페이지에서 팝업 표시
✅ AC-2: is_popup=false인 공지사항은 팝업 미표시
✅ AC-3: 시간 범위 외 공지사항은 팝업 미표시
✅ AC-4: 닫기 버튼 클릭 시 팝업 숨김 (재방문 시 재표시)
✅ AC-5: "다시 보지 않기" 클릭 시 localStorage 저장 및 영구 숨김
✅ AC-6: 관리자 작성 폼에 팝업 설정 UI 표시
✅ AC-7: 수정 페이지에서 기존 팝업 설정 로드
✅ AC-8: 팝업 체크박스 토글 시 날짜 필드 표시/숨김
✅ AC-9: 관리자 목록에서 팝업 상태 확인 가능 (향후 구현 권장)
✅ AC-10: 다중 팝업 시 최신 1개만 표시

## 향후 개선 사항

1. **관리자 목록 페이지 개선** (`src/app/announcements/page.tsx`):
   - 팝업 활성 상태 배지 표시
   - 팝업 표시 기간 정보 표시

2. **통계 기능**:
   - `popup_display_count` 필드를 활용한 팝업 노출 횟수 추적

3. **다중 팝업 지원**:
   - 우선순위 필드 추가
   - 여러 팝업을 순차적으로 표시

## 파일 목록

### 신규 생성
- `supabase/migrations/04_announcement_popup.sql`
- `src/components/AnnouncementPopup.tsx`
- `src/app/announcements/components/AnnouncementForm.tsx`
- `src/app/announcements/[id]/edit/page.tsx`

### 수정
- `src/app/announcements/actions.ts`
- `src/app/announcements/new/page.tsx`
- `src/app/announcements/[id]/page.tsx`
- `src/app/page.tsx`

## 기술 스택
- Next.js 15 (App Router)
- React 19
- Supabase (PostgreSQL)
- TypeScript
- Tailwind CSS
