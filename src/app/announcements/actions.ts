"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createAnnouncement(formData: FormData) {
  const { user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isPopup = formData.get("is_popup") === "true";
  const popupStartDate = String(formData.get("popup_start_date") ?? "").trim() || null;
  const popupEndDate = String(formData.get("popup_end_date") ?? "").trim() || null;

  if (!title || !content) {
    redirect(
      `/announcements/new?error=${encodeURIComponent("제목과 내용을 입력해주세요")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title,
      content,
      author_id: user.id,
      is_popup: isPopup,
      popup_start_date: popupStartDate,
      popup_end_date: popupEndDate,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/announcements/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/announcements");
  revalidatePath("/");
  redirect(`/announcements/${data!.id}`);
}

export async function updateAnnouncement(id: number, formData: FormData) {
  const { user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isPopup = formData.get("is_popup") === "true";
  const popupStartDate = String(formData.get("popup_start_date") ?? "").trim() || null;
  const popupEndDate = String(formData.get("popup_end_date") ?? "").trim() || null;

  if (!title || !content) {
    redirect(
      `/announcements/${id}/edit?error=${encodeURIComponent("제목과 내용을 입력해주세요")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({
      title,
      content,
      is_popup: isPopup,
      popup_start_date: popupStartDate,
      popup_end_date: popupEndDate,
    })
    .eq("id", id);

  if (error) {
    redirect(`/announcements/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/announcements");
  revalidatePath("/");
  redirect(`/announcements/${id}`);
}

export async function deleteAnnouncement(id: number) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);
  revalidatePath("/announcements");
  revalidatePath("/");
  redirect("/announcements");
}
