import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "admin" | "member";
  created_at: string;
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
}

export async function requireUser() {
  const data = await getCurrentUser();
  if (!data?.user) {
    throw new Error("로그인이 필요합니다.");
  }
  return data;
}

export async function requireAdmin() {
  const data = await requireUser();
  if (data.profile?.role !== "admin") {
    throw new Error("관리자 권한이 필요합니다.");
  }
  return data;
}
