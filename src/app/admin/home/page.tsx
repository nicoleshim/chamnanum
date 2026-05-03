import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getSettings,
  parseJsonArray,
  type FeaturedCard,
  type QuickInfoItem,
  type GalleryItem,
  type ExternalLink,
} from "@/lib/settings";
import AdminNav from "@/components/AdminNav";
import RichEditor from "@/components/RichEditor";
import ListEditor from "@/components/admin/ListEditor";
import { updateHomeSettings } from "./actions";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/");

  const sp = await searchParams;
  const settings = await getSettings([
    "home_hero_title",
    "home_hero_subtitle",
    "home_hero_image_url",
    "home_body",
    "home_featured_cards",
    "home_quick_info",
    "home_gallery",
    "home_external_links_title",
    "home_external_links_desc",
    "home_external_links",
  ]);

  const featuredCards = parseJsonArray<FeaturedCard>(settings.home_featured_cards);
  const quickInfo = parseJsonArray<QuickInfoItem>(settings.home_quick_info);
  const gallery = parseJsonArray<GalleryItem>(settings.home_gallery);
  const externalLinks = parseJsonArray<ExternalLink>(settings.home_external_links);

  return (
    <div>
      <AdminNav active="/admin/home" />

      <h1 className="text-2xl font-bold mb-2">메인 페이지 편집</h1>
      <p className="text-sm text-stone-500 mb-6">
        홈페이지의 각 섹션을 직접 편집합니다. 이미지는 업로드 버튼으로 바로 올릴 수 있습니다.
      </p>

      {sp.saved && (
        <div className="mb-4 p-3 rounded bg-emerald-50 text-emerald-800 text-sm">
          저장되었습니다.
        </div>
      )}
      {sp.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {sp.error}
        </div>
      )}

      <form action={updateHomeSettings} className="space-y-6">
        {/* 1. Hero */}
        <Section title="① 상단 Hero" hint="페이지 최상단에 큰 배너로 표시됩니다.">
          <Field label="제목">
            <input
              name="home_hero_title"
              defaultValue={settings.home_hero_title}
              className={inputCls}
            />
          </Field>
          <Field label="부제목">
            <textarea
              name="home_hero_subtitle"
              rows={2}
              defaultValue={settings.home_hero_subtitle}
              className={inputCls}
            />
          </Field>
          <Field label="배경 이미지 URL (비워두면 기본 그라데이션)">
            <input
              name="home_hero_image_url"
              defaultValue={settings.home_hero_image_url}
              placeholder="https://..."
              className={`${inputCls} font-mono text-sm`}
            />
            {settings.home_hero_image_url && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.home_hero_image_url}
                  alt=""
                  className="max-h-32 rounded border border-stone-200"
                />
              </div>
            )}
          </Field>
        </Section>

        {/* 2. Featured Cards */}
        <Section
          title="② 사업 소개 카드"
          hint="이미지 + 제목 + 부제목 + 링크. 그리드로 표시됩니다."
        >
          <ListEditor
            name="home_featured_cards"
            defaultValue={featuredCards}
            itemLabel="카드"
            fields={[
              { name: "image_url", label: "이미지", type: "image" },
              { name: "title", label: "제목", type: "text", placeholder: "예: 밥상공동체 '밥퍼'" },
              { name: "subtitle", label: "부제목", type: "text", placeholder: "선택" },
              { name: "link_url", label: "링크 URL", type: "text", placeholder: "/about/intro 또는 https://..." },
            ]}
          />
        </Section>

        {/* 3. Quick Info (3 fixed slots) */}
        <Section
          title="③ 3단 정보 (후원 / 봉사 / 연락처)"
          hint="고정 3칸. 비우면 해당 칸이 숨겨집니다."
        >
          <ListEditor
            name="home_quick_info"
            defaultValue={quickInfo}
            fixedCount={3}
            itemLabel="정보"
            fields={[
              { name: "title", label: "제목", type: "text" },
              { name: "body", label: "내용 (줄바꿈 가능)", type: "textarea" },
              { name: "link_url", label: "링크 URL (선택)", type: "text" },
              { name: "link_text", label: "링크 텍스트 (선택)", type: "text", placeholder: "자세히 보기" },
            ]}
          />
        </Section>

        {/* 4. Body markdown */}
        <Section
          title="④ 추가 본문"
          hint="3단 정보 아래에 표시됩니다. 마크다운 + 이미지 붙여넣기 지원."
        >
          <RichEditor name="home_body" defaultValue={settings.home_body} rows={10} />
        </Section>

        {/* 5. Gallery */}
        <Section
          title="⑤ 활동사진 갤러리"
          hint="가로 스크롤로 표시됩니다. 이미지를 추가/삭제하고 클릭 시 이동할 링크를 지정할 수 있습니다."
        >
          <ListEditor
            name="home_gallery"
            defaultValue={gallery}
            itemLabel="사진"
            fields={[
              { name: "image_url", label: "이미지", type: "image" },
              { name: "caption", label: "캡션 (선택)", type: "text" },
              { name: "link_url", label: "클릭 시 이동 (선택)", type: "text" },
            ]}
          />
        </Section>

        {/* 6. External links (공익위반제보) */}
        <Section
          title="⑥ 공익위반제보 / 외부 링크"
          hint="외부 사이트로 연결되는 버튼들. 21UCM의 '공익위반제보' 영역과 동일한 형태입니다."
        >
          <Field label="섹션 제목">
            <input
              name="home_external_links_title"
              defaultValue={settings.home_external_links_title}
              className={inputCls}
            />
          </Field>
          <Field label="섹션 설명">
            <textarea
              name="home_external_links_desc"
              rows={3}
              defaultValue={settings.home_external_links_desc}
              className={inputCls}
            />
          </Field>
          <ListEditor
            name="home_external_links"
            defaultValue={externalLinks}
            itemLabel="링크"
            fields={[
              { name: "image_url", label: "아이콘 이미지", type: "image" },
              { name: "title", label: "버튼 제목", type: "text", placeholder: "예: 국민권익위원회 바로가기" },
              { name: "url", label: "외부 URL", type: "text", placeholder: "https://www.acrc.go.kr/..." },
            ]}
          />
        </Section>

        <div className="sticky bottom-4 flex justify-end gap-2 z-10">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 font-medium"
          >
            전체 저장
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <p className="text-xs text-stone-500 mt-1">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
