import { redirect } from "next/navigation";
import { createSchedule } from "../actions";
import { getCurrentUser } from "@/lib/auth";
import RichEditor from "@/components/RichEditor";

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/schedule");

  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 일정 등록</h1>
      {params.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {params.error}
        </div>
      )}
      <form
        action={createSchedule}
        className="bg-white rounded-xl border border-stone-200 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            name="title"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">시작 일시</label>
            <input
              name="start_at"
              type="datetime-local"
              required
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              종료 일시 (선택)
            </label>
            <input
              name="end_at"
              type="datetime-local"
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">장소 (선택)</label>
          <input
            name="location"
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            설명 (선택){" "}
            <span className="text-xs text-stone-500 font-normal">
              (이미지 붙여넣기 / 파일 첨부 가능)
            </span>
          </label>
          <RichEditor name="description" rows={6} />
        </div>
        <div className="flex justify-end gap-2">
          <a
            href="/schedule"
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
