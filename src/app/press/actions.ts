"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

function readForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    source_name: String(formData.get("source_name") ?? "").trim(),
    reporter: String(formData.get("reporter") ?? "").trim() || null,
    published_date: String(formData.get("published_date") ?? "").trim() || null,
    url: String(formData.get("url") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim() || null,
  };
}

export async function createPressArticle(formData: FormData) {
  const { user } = await requireAdmin();
  const fields = readForm(formData);

  if (!fields.title || !fields.source_name || !fields.url) {
    redirect(
      `/press/new?error=${encodeURIComponent("제목, 언론사, 원문 URL을 입력해주세요")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("press_articles")
    .insert({ ...fields, author_id: user.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/press/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/press");
  redirect(`/press/${data!.id}`);
}

export async function updatePressArticle(id: number, formData: FormData) {
  await requireAdmin();
  const fields = readForm(formData);

  if (!fields.title || !fields.source_name || !fields.url) {
    redirect(
      `/press/${id}/edit?error=${encodeURIComponent("제목, 언론사, 원문 URL을 입력해주세요")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("press_articles")
    .update(fields)
    .eq("id", id);

  if (error) {
    redirect(`/press/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/press");
  redirect(`/press/${id}`);
}

export async function deletePressArticle(id: number) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("press_articles").delete().eq("id", id);
  revalidatePath("/press");
  redirect("/press");
}
