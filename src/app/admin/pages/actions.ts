"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

function parseForm(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const link_override = String(formData.get("link_override") ?? "").trim();
  const parentRaw = String(formData.get("parent_id") ?? "");
  const parent_id = parentRaw && parentRaw !== "" ? Number(parentRaw) : null;
  const sort_order = Number(formData.get("sort_order") ?? 0) || 0;
  const is_published = formData.get("is_published") === "on";
  return {
    slug,
    title,
    content,
    link_override,
    parent_id,
    sort_order,
    is_published,
  };
}

function validate(slug: string, title: string): string | null {
  if (!title) return "제목을 입력해주세요";
  if (!slug) return "URL slug 를 입력해주세요";
  if (!SLUG_RE.test(slug))
    return "slug 는 영문 소문자, 숫자, 하이픈만 사용 가능합니다";
  return null;
}

export async function createPage(formData: FormData) {
  await requireAdmin();
  const f = parseForm(formData);
  const err = validate(f.slug, f.title);
  if (err) {
    redirect(`/admin/pages/new?error=${encodeURIComponent(err)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pages").insert({
    parent_id: f.parent_id,
    slug: f.slug,
    title: f.title,
    content: f.content || null,
    link_override: f.link_override || null,
    sort_order: f.sort_order,
    is_published: f.is_published,
  });

  if (error) {
    redirect(`/admin/pages/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  redirect("/admin/pages");
}

export async function updatePage(id: number, formData: FormData) {
  await requireAdmin();
  const f = parseForm(formData);
  const err = validate(f.slug, f.title);
  if (err) {
    redirect(`/admin/pages/${id}?error=${encodeURIComponent(err)}`);
  }

  if (f.parent_id === id) {
    redirect(
      `/admin/pages/${id}?error=${encodeURIComponent("자기 자신을 상위로 지정할 수 없습니다")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pages")
    .update({
      parent_id: f.parent_id,
      slug: f.slug,
      title: f.title,
      content: f.content || null,
      link_override: f.link_override || null,
      sort_order: f.sort_order,
      is_published: f.is_published,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/pages/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  redirect("/admin/pages");
}

export async function deletePage(id: number) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("pages").delete().eq("id", id);
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  redirect("/admin/pages");
}
