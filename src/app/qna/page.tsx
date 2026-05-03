import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export default async function QnaPage() {
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("qna_questions")
    .select(
      "id, title, created_at, profiles(display_name), qna_answers(count)",
    )
    .order("created_at", { ascending: false });

  const data = await getCurrentUser();
  const isLoggedIn = !!data?.user;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Q&A</h1>
          <p className="text-sm text-stone-500 mt-1">
            궁금하신 점을 자유롭게 질문해주세요.
          </p>
        </div>
        {isLoggedIn ? (
          <Link
            href="/qna/new"
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            질문하기
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-100 text-sm"
          >
            로그인 후 질문하기
          </Link>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {questions && questions.length > 0 ? (
          <ul className="divide-y divide-stone-100">
            {questions.map((q) => {
              const profile = Array.isArray(q.profiles)
                ? q.profiles[0]
                : q.profiles;
              const answerCount =
                (Array.isArray(q.qna_answers) ? q.qna_answers[0]?.count : 0) ??
                0;
              return (
                <li key={q.id}>
                  <Link
                    href={`/qna/${q.id}`}
                    className="flex items-center justify-between p-5 hover:bg-stone-50 gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{q.title}</div>
                      <div className="text-xs text-stone-500 mt-1">
                        {profile?.display_name ?? "익명"} ·{" "}
                        {new Date(q.created_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded shrink-0 ${
                        answerCount > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      답변 {answerCount}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-10 text-center text-stone-500">
            아직 질문이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
