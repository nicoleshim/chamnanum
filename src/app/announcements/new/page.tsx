import { redirect } from "next/navigation";
import { createAnnouncement } from "../actions";
import { getCurrentUser } from "@/lib/auth";
import RichEditor from "@/components/RichEditor";

export default async function NewAnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/announcements");

  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 공지사항 작성</h1>
      {params.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {params.error}
        </div>
      )}
      <form
        action={createAnnouncement}
        className="bg-white rounded-xl border border-stone-200 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            name="title"
            type="text"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            내용{" "}
            <span className="text-xs text-stone-500 font-normal">
              (이미지 붙여넣기 / 파일 첨부 가능)
            </span>
          </label>
          <RichEditor name="content" required rows={14} />
        </div>
        <div className="flex justify-end gap-2">
          <a
            href="/announcements"
            className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-100"
          >
            취소
          </a>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}
