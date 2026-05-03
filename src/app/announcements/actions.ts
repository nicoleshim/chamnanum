"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createAnnouncement(formData: FormData) {
  const { user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    redirect(
      `/announcements/new?error=${encodeURIComponent("제목과 내용을 입력해주세요")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({ title, content, author_id: user.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/announcements/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/announcements");
  revalidatePath("/");
  redirect(`/announcements/${data!.id}`);
}

export async function deleteAnnouncement(id: number) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/announcements");
  revalidatePath("/");
  redirect("/announcements");
}
