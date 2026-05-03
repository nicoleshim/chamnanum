import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export default async function MembersPage() {
  const userData = await getCurrentUser();
  if (!userData?.user) {
    redirect(
      `/login?error=${encodeURIComponent("회원게시판은 로그인 후 이용 가능합니다")}`,
    );
  }

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("member_posts")
    .select(
      "id, title, created_at, profiles(display_name), member_comments(count)",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">회원 게시판</h1>
          <p className="text-sm text-stone-500 mt-1">
            참나눔회 회원들이 자유롭게 소통하는 공간입니다.
          </p>
        </div>
        <Link
          href="/members/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
        >
          글쓰기
        </Link>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {posts && posts.length > 0 ? (
          <ul className="divide-y divide-stone-100">
            {posts.map((p) => {
              const profile = Array.isArray(p.profiles)
                ? p.profiles[0]
                : p.profiles;
              const cmts =
                (Array.isArray(p.member_comments)
                  ? p.member_comments[0]?.count
                  : 0) ?? 0;
              return (
                <li key={p.id}>
                  <Link
                    href={`/members/${p.id}`}
                    className="flex items-center justify-between p-5 hover:bg-stone-50 gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {p.title}
                        {cmts > 0 && (
                          <span className="ml-2 text-xs text-emerald-700">
                            [{cmts}]
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        {profile?.display_name ?? "회원"} ·{" "}
                        {new Date(p.created_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-10 text-center text-stone-500">
            아직 게시글이 없습니다. 첫 글을 작성해보세요!
          </p>
        )}
      </div>
    </div>
  );
}
