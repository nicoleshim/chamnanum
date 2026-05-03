import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, created_at, profiles(display_name)")
    .order("created_at", { ascending: false });

  const data = await getCurrentUser();
  const isAdmin = data?.profile?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">공지사항</h1>
          <p className="text-sm text-stone-500 mt-1">
            참나눔회의 새로운 소식을 알려드립니다.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/announcements/new"
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            새 공지 작성
          </Link>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {announcements && announcements.length > 0 ? (
          <ul className="divide-y divide-stone-100">
            {announcements.map((a) => {
              const profile = Array.isArray(a.profiles)
                ? a.profiles[0]
                : a.profiles;
              return (
                <li key={a.id}>
                  <Link
                    href={`/announcements/${a.id}`}
                    className="block p-5 hover:bg-stone-50"
                  >
                    <div className="font-medium mb-1">{a.title}</div>
                    <div className="text-xs text-stone-500">
                      {profile?.display_name ?? "관리자"} ·{" "}
                      {new Date(a.created_at).toLocaleDateString("ko-KR")}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-10 text-center text-stone-500">
            등록된 공지사항이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
