import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import Markdown from "@/components/Markdown";
import RichEditor from "@/components/RichEditor";
import { createAnswer, deleteAnswer, deleteQuestion } from "../actions";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: question } = await supabase
    .from("qna_questions")
    .select("id, title, content, created_at, author_id, profiles(display_name)")
    .eq("id", id)
    .single();

  if (!question) notFound();

  const { data: answers } = await supabase
    .from("qna_answers")
    .select("id, content, created_at, author_id, profiles(display_name)")
    .eq("question_id", id)
    .order("created_at", { ascending: true });

  const userData = await getCurrentUser();
  const me = userData?.user;
  const isAdmin = userData?.profile?.role === "admin";

  const profile = Array.isArray(question.profiles)
    ? question.profiles[0]
    : question.profiles;

  const handleAnswer = createAnswer.bind(null, question.id);
  const handleDeleteQuestion = deleteQuestion.bind(null, question.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <article className="bg-white border border-stone-200 rounded-xl p-8">
        <div className="mb-4 pb-4 border-b border-stone-100">
          <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
          <div className="text-sm text-stone-500">
            {profile?.display_name ?? "익명"} ·{" "}
            {new Date(question.created_at).toLocaleString("ko-KR")}
          </div>
        </div>
        <Markdown content={question.content} />
        {(me?.id === question.author_id || isAdmin) && (
          <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
            <form action={handleDeleteQuestion}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:underline"
              >
                질문 삭제
              </button>
            </form>
          </div>
        )}
      </article>

      <section>
        <h2 className="text-lg font-bold mb-3">
          답변 {answers?.length ?? 0}개
        </h2>
        <div className="space-y-3">
          {answers && answers.length > 0 ? (
            answers.map((a) => {
              const ap = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
              const handleDel = deleteAnswer.bind(null, a.id, question.id);
              return (
                <div
                  key={a.id}
                  className="bg-white border border-stone-200 rounded-xl p-5"
                >
                  <div className="text-sm text-stone-500 mb-2">
                    {ap?.display_name ?? "익명"} ·{" "}
                    {new Date(a.created_at).toLocaleString("ko-KR")}
                  </div>
                  <Markdown content={a.content} />
                  {(me?.id === a.author_id || isAdmin) && (
                    <form action={handleDel} className="mt-3 text-right">
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:underline"
                      >
                        삭제
                      </button>
                    </form>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-stone-500 bg-white border border-stone-200 rounded-xl p-5">
              아직 답변이 없습니다.
            </p>
          )}
        </div>
      </section>

      {me ? (
        <form
          action={handleAnswer}
          className="bg-white border border-stone-200 rounded-xl p-5 space-y-3"
        >
          <label className="block text-sm font-medium">답변 작성</label>
          <RichEditor
            name="content"
            required
            rows={5}
            placeholder="따뜻하고 정확한 답변을 부탁드립니다."
          />
          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
            >
              답변 등록
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl p-5 text-center text-sm text-stone-600">
          답변을 작성하려면{" "}
          <Link href="/login" className="text-emerald-700 hover:underline">
            로그인
          </Link>
          이 필요합니다.
        </div>
      )}

      <div>
        <Link
          href="/qna"
          className="text-sm text-stone-600 hover:text-emerald-700"
        >
          ← 목록으로
        </Link>
      </div>
    </div>
  );
}
