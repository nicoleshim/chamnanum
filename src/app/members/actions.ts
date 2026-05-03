"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function createMemberPost(formData: FormData) {
  const { user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    redirect(
      `/members/new?error=${encodeURIComponent("제목과 내용을 입력해주세요")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("member_posts")
    .insert({ title, content, author_id: user.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/members/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/members");
  redirect(`/members/${data!.id}`);
}

export async function createMemberComment(
  postId: number,
  formData: FormData,
) {
  const { user } = await requireUser();
  const content = String(formData.get("content") ?? "").trim();

  if (!content) return;

  const supabase = await createClient();
  await supabase.from("member_comments").insert({
    post_id: postId,
    content,
    author_id: user.id,
  });

  revalidatePath(`/members/${postId}`);
}

export async function deleteMemberPost(id: number) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("member_posts").delete().eq("id", id);
  revalidatePath("/members");
  redirect("/members");
}

export async function deleteMemberComment(id: number, postId: number) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("member_comments").delete().eq("id", id);
  revalidatePath(`/members/${postId}`);
}
