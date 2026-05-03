"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_KEYS = [
  "home_hero_title",
  "home_hero_subtitle",
  "home_hero_image_url",
  "home_body",
  "home_featured_cards",
  "home_quick_info",
  "home_gallery",
  "home_external_links_title",
  "home_external_links_desc",
  "home_external_links",
] as const;

const JSON_KEYS = new Set([
  "home_featured_cards",
  "home_quick_info",
  "home_gallery",
  "home_external_links",
]);

export async function updateHomeSettings(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const updates: { key: string; value: string }[] = [];
  for (const key of ALLOWED_KEYS) {
    const v = formData.get(key);
    if (typeof v !== "string") continue;

    let value = v;
    if (JSON_KEYS.has(key)) {
      // 검증: 유효한 JSON 배열인지 확인
      try {
        const parsed = JSON.parse(v);
        if (!Array.isArray(parsed)) throw new Error("not array");
        value = JSON.stringify(parsed);
      } catch {
        redirect(
          `/admin/home?error=${encodeURIComponent(`'${key}' 데이터 형식 오류`)}`,
        );
      }
    }
    updates.push({ key, value });
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert(updates, { onConflict: "key" });

  if (error) {
    redirect(`/admin/home?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/home");
  redirect("/admin/home?saved=1");
}
