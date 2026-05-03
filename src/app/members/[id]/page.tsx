import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import Markdown from "@/components/Markdown";
import RichEditor from "@/components/RichEditor";
import {
  createMemberComment,
  deleteMemberComment,
  deleteMemberPost,
} from "../actions";

export default async function MemberPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userData = await getCurrentUser();
  if (!userData?.user) redirect("/login");

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("member_posts")
    .select("id, title, content, created_at, author_id, profiles(display_name)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("member_comments")
    .select("id, content, created_at, author_id, profiles(display_name)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const me = userData.user;
  const isAdmin = userData.profile?.role === "admin";
  const profile = Array.isArray(post.profiles)
    ? post.profiles[0]
    : post.profiles;

  const handleComment = createMemberComment.bind(null, post.id);
  const handleDeletePost = deleteMemberPost.bind(null, post.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <article className="bg-white border border-stone-200 rounded-xl p-8">
        <div className="mb-4 pb-4 border-b border-stone-100">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="text-sm text-stone-500">
            {profile?.display_name ?? "회원"} ·{" "}
            {new Date(post.created_at).toLocaleString("ko-KR")}
          </div>
        </div>
        <Markdown content={post.content} />
        {(me.id === post.author_id || isAdmin) && (
          <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
            <form action={handleDeletePost}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:underline"
              >
                글 삭제
              </button>
            </form>
          </div>
        )}
      </article>

      <section>
        <h2 className="text-lg font-bold mb-3">
          댓글 {comments?.length ?? 0}개
        </h2>
        <div className="space-y-2 mb-4">
          {comments && comments.length > 0 ? (
            comments.map((c) => {
              const cp = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
              const handleDel = deleteMemberComment.bind(null, c.id, post.id);
              return (
                <div
                  key={c.id}
                  className="bg-white border border-stone-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>{cp?.display_name ?? "회원"}</span>
                    <span>
                      {new Date(c.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <div className="text-sm">
                    <Markdown content={c.content} />
                  </div>
                  {(me.id === c.author_id || isAdmin) && (
                    <form action={handleDel} className="mt-2 text-right">
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
            <p className="text-sm text-stone-500 bg-white border border-stone-200 rounded-lg p-4">
              아직 댓글이 없습니다.
            </p>
          )}
        </div>

        <form
          action={handleComment}
          className="bg-white border border-stone-200 rounded-lg p-4 space-y-2"
        >
          <RichEditor
            name="content"
            required
            rows={3}
            placeholder="댓글을 입력하세요. 이미지 붙여넣기 가능."
          />
          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
            >
              댓글 등록
            </button>
          </div>
        </form>
      </section>

      <div>
        <Link
          href="/members"
          className="text-sm text-stone-600 hover:text-emerald-700"
        >
          ← 목록으로
        </Link>
      </div>
    </div>
  );
}
