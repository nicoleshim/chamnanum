import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export default async function PressPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("press_articles")
    .select("id, title, source_name, reporter, published_date, url")
    .order("published_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const data = await getCurrentUser();
  const isAdmin = data?.profile?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">언론보도</h1>
          <p className="text-sm text-stone-500 mt-1">
            참나눔회를 다룬 언론 기사를 모아봅니다.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/press/new"
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            기사 등록
          </Link>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {articles && articles.length > 0 ? (
          <ul className="divide-y divide-stone-100">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/press/${a.id}`}
                  className="block p-5 hover:bg-stone-50"
                >
                  <div className="font-medium mb-1">{a.title}</div>
                  <div className="text-xs text-stone-500">
                    {a.source_name}
                    {a.reporter ? ` · ${a.reporter}` : ""}
                    {a.published_date
                      ? ` · ${new Date(a.published_date).toLocaleDateString("ko-KR")}`
                      : ""}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-10 text-center text-stone-500">
            등록된 언론보도가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
