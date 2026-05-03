"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function createQuestion(formData: FormData) {
  const { user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    redirect(
      `/qna/new?error=${encodeURIComponent("제목과 내용을 입력해주세요")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qna_questions")
    .insert({ title, content, author_id: user.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/qna/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/qna");
  redirect(`/qna/${data!.id}`);
}

export async function createAnswer(questionId: number, formData: FormData) {
  const { user } = await requireUser();
  const content = String(formData.get("content") ?? "").trim();

  if (!content) return;

  const supabase = await createClient();
  await supabase.from("qna_answers").insert({
    question_id: questionId,
    content,
    author_id: user.id,
  });

  revalidatePath(`/qna/${questionId}`);
}

export async function deleteQuestion(id: number) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("qna_questions").delete().eq("id", id);
  revalidatePath("/qna");
  redirect("/qna");
}

export async function deleteAnswer(id: number, questionId: number) {
  await requireUser();
  const supabase = await createClient();
  await supabase.from("qna_answers").delete().eq("id", id);
  revalidatePath(`/qna/${questionId}`);
}
