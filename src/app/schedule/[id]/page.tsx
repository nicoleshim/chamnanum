import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import Markdown from "@/components/Markdown";
import { deleteSchedule } from "../actions";

const KR_TZ = "Asia/Seoul";

const fmtFull = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KR_TZ,
  dateStyle: "full",
  timeStyle: "short",
});

const fmtTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KR_TZ,
  timeStyle: "short",
});

const fmtMonth = new Intl.DateTimeFormat("en-CA", {
  timeZone: KR_TZ,
  year: "numeric",
  month: "2-digit",
});

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: s } = await supabase
    .from("schedules")
    .select("id, title, description, start_at, end_at, location")
    .eq("id", id)
    .single();

  if (!s) notFound();

  const userData = await getCurrentUser();
  const isAdmin = userData?.profile?.role === "admin";

  const start = new Date(s.start_at);
  const end = s.end_at ? new Date(s.end_at) : null;
  const ym = fmtMonth.format(start).replace("-", "-"); // YYYY-MM

  return (
    <article className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-xl p-8">
      <h1 className="text-2xl font-bold mb-4">{s.title}</h1>

      <dl className="space-y-3 text-sm border-t border-stone-100 pt-4">
        <div className="flex">
          <dt className="w-20 text-stone-500">일시</dt>
          <dd className="text-stone-800">
            {fmtFull.format(start)}
            {end && ` ~ ${fmtTime.format(end)}`}
          </dd>
        </div>
        {s.location && (
          <div className="flex">
            <dt className="w-20 text-stone-500">장소</dt>
            <dd className="text-stone-800">{s.location}</dd>
          </div>
        )}
      </dl>

      {s.description && (
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="text-sm text-stone-500 mb-2">상세 내용</div>
          <Markdown content={s.description} />
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between items-center">
        <Link
          href={`/schedule?ym=${ym}`}
          className="text-sm text-stone-600 hover:text-emerald-700"
        >
          ← 캘린더로
        </Link>
        {isAdmin && (
          <form action={deleteSchedule.bind(null, s.id)}>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50"
            >
              삭제
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
