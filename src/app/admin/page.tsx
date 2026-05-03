import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import { setUserRole } from "./actions";

export default async function AdminPage() {
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminNav active="/admin" />
      <h1 className="text-2xl font-bold mb-2">회원 권한 관리</h1>
      <p className="text-sm text-stone-500 mb-6">
        관리자만 공지/일정을 등록하거나 페이지·메뉴를 관리할 수 있습니다.
      </p>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">가입일</th>
              <th className="px-4 py-3 font-medium">권한</th>
              <th className="px-4 py-3 font-medium">변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {profiles?.map((p) => {
              const isMe = p.id === data.user.id;
              const promote = setUserRole.bind(null, p.id, "admin");
              const demote = setUserRole.bind(null, p.id, "member");
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.display_name ?? "-"}</td>
                  <td className="px-4 py-3 text-stone-600">{p.email ?? "-"}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">
                    {new Date(p.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        p.role === "admin"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {p.role === "admin" ? "관리자" : "회원"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isMe ? (
                      <span className="text-xs text-stone-400">본인</span>
                    ) : p.role === "admin" ? (
                      <form action={demote}>
                        <button
                          type="submit"
                          className="text-xs px-2 py-1 border border-stone-300 rounded hover:bg-stone-100"
                        >
                          회원으로
                        </button>
                      </form>
                    ) : (
                      <form action={promote}>
                        <button
                          type="submit"
                          className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          관리자로
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
