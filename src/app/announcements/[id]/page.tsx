import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import Markdown from "@/components/Markdown";
import { deleteAnnouncement } from "../actions";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: a } = await supabase
    .from("announcements")
    .select("id, title, content, created_at, profiles(display_name)")
    .eq("id", id)
    .single();

  if (!a) notFound();

  const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;

  const userData = await getCurrentUser();
  const isAdmin = userData?.profile?.role === "admin";

  const handleDelete = deleteAnnouncement.bind(null, a.id);

  return (
    <article className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-xl p-8">
      <div className="mb-6 pb-6 border-b border-stone-100">
        <h1 className="text-2xl font-bold mb-2">{a.title}</h1>
        <div className="text-sm text-stone-500">
          {profile?.display_name ?? "관리자"} ·{" "}
          {new Date(a.created_at).toLocaleString("ko-KR")}
        </div>
      </div>

      <Markdown content={a.content} />

      <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between items-center">
        <Link
          href="/announcements"
          className="text-sm text-stone-600 hover:text-emerald-700"
        >
          ← 목록으로
        </Link>
        {isAdmin && (
          <form action={handleDelete}>
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
