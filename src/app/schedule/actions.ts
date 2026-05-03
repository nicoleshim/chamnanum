"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createSchedule(formData: FormData) {
  const { user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startAt = String(formData.get("start_at") ?? "");
  const endAt = String(formData.get("end_at") ?? "");
  const location = String(formData.get("location") ?? "").trim();

  if (!title || !startAt) {
    redirect(
      `/schedule/new?error=${encodeURIComponent("제목과 시작 시간을 입력해주세요")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("schedules").insert({
    title,
    description: description || null,
    start_at: new Date(startAt).toISOString(),
    end_at: endAt ? new Date(endAt).toISOString() : null,
    location: location || null,
    author_id: user.id,
  });

  if (error) {
    redirect(`/schedule/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/schedule");
  revalidatePath("/");
  redirect("/schedule");
}

export async function deleteSchedule(id: number) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("schedules").delete().eq("id", id);
  revalidatePath("/schedule");
  revalidatePath("/");
  redirect("/schedule");
}
