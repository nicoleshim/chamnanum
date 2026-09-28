import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { deletePressArticle } from "../actions";

export default async function PressDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: a } = await supabase
    .from("press_articles")
    .select("id, title, source_name, reporter, published_date, url, summary")
    .eq("id", id)
    .single();

  if (!a) notFound();

  const userData = await getCurrentUser();
  const isAdmin = userData?.profile?.role === "admin";

  const handleDelete = deletePressArticle.bind(null, a.id);

  return (
    <article className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-xl p-8">
      <div className="mb-6 pb-6 border-b border-stone-100">
        <h1 className="text-2xl font-bold mb-2">{a.title}</h1>
        <div className="text-sm text-stone-500">
          {a.source_name}
          {a.reporter ? ` · ${a.reporter}` : ""}
          {a.published_date
            ? ` · ${new Date(a.published_date).toLocaleDateString("ko-KR")}`
            : ""}
        </div>
      </div>

      {a.summary && (
        <p className="whitespace-pre-line text-stone-800 leading-relaxed mb-6">
          {a.summary}
        </p>
      )}

      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 border border-emerald-300 text-emerald-700 rounded hover:bg-emerald-50 text-sm"
      >
        원문 기사 보기 →
      </a>

      <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between items-center">
        <Link
          href="/press"
          className="text-sm text-stone-600 hover:text-emerald-700"
        >
          ← 목록으로
        </Link>
        {isAdmin && (
          <div className="flex gap-2">
            <Link
              href={`/press/${a.id}/edit`}
              className="px-3 py-1.5 text-sm border border-emerald-300 text-emerald-700 rounded hover:bg-emerald-50"
            >
              수정
            </Link>
            <form action={handleDelete}>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50"
              >
                삭제
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
