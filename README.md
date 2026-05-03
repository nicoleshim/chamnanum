# 참나눔회 웹사이트

참나눔회(기부 단체) 소개 웹사이트입니다. 공지사항·일정·Q&A·회원 게시판을 제공합니다.

## 기술 스택

- **Next.js 16** (App Router, Turbopack)
- **TypeScript + Tailwind CSS v4**
- **Supabase** (인증 + Postgres + RLS)

## 페이지 구조

| 경로 | 설명 | 권한 |
| --- | --- | --- |
| `/` | 단체 소개, 최근 공지/일정 미리보기 | 누구나 |
| `/announcements` | 공지사항 목록/상세 | 누구나 (작성: 관리자) |
| `/schedule` | 행사·활동 일정 | 누구나 (작성: 관리자) |
| `/qna` | Q&A 게시판 | 누구나 보기, 로그인 후 작성 |
| `/members` | 회원 게시판 | 로그인 회원만 |
| `/admin` | 회원 권한 관리 | 관리자만 |

## 시작하기

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 가입 → New Project 생성 (region 은 `Northeast Asia (Seoul)` 권장)
2. **Project Settings → API** 에서 두 값을 복사:
   - `Project URL`
   - `anon public` key

### 2. 환경 변수 설정

`.env.local.example` 을 복사해 `.env.local` 을 만들고 위에서 복사한 값을 붙여넣습니다.

```bash
cp .env.local.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

### 3. 데이터베이스 스키마 적용

Supabase 대시보드 → **SQL Editor → New query** 에 [`supabase/schema.sql`](./supabase/schema.sql) 의 내용을 붙여넣고 **Run**.
테이블, RLS 정책, 회원가입 트리거가 한 번에 생성됩니다.

### 4. 인증 설정 (선택)

개발 중 이메일 확인을 건너뛰려면 **Authentication → Providers → Email** 에서 "Confirm email" 을 끕니다.

### 5. 개발 서버 실행

```bash
npm install
npm run dev
```

→ <http://localhost:3000>

### 6. 첫 관리자 지정

1. 사이트에서 회원가입을 1회 진행합니다.
2. Supabase 대시보드 → **Table Editor → profiles** 에서 본인 행의 `role` 을 `admin` 으로 직접 변경합니다.
3. 이후 `/admin` 페이지에서 다른 회원의 권한을 변경할 수 있습니다.

## 배포 (Vercel)

1. GitHub에 push
2. [vercel.com](https://vercel.com) → Import Project
3. Environment Variables 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등록
4. Deploy

배포 후 Supabase **Authentication → URL Configuration → Site URL** 을 배포 도메인으로 변경하세요.

## 폴더 구조

```
src/
  app/
    (auth)/actions.ts      로그인/회원가입/로그아웃
    page.tsx               홈
    login/, signup/
    announcements/         공지 (list/detail/new + actions)
    schedule/              일정
    qna/                   질문/답변
    members/               회원 게시판
    admin/                 권한 관리
  components/Header.tsx
  lib/
    auth.ts                현재 사용자/권한 헬퍼
    supabase/{client,server,middleware}.ts
  proxy.ts                 세션 쿠키 갱신 (Next.js 16 proxy)
supabase/schema.sql        DB 스키마 + RLS 정책
```
