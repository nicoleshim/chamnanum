import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import PressArticleForm from "../../components/PressArticleForm";
import { updatePressArticle } from "../../actions";

export default async function EditPressArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/press");

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("press_articles")
    .select("id, title, source_name, reporter, published_date, url, summary")
    .eq("id", id)
    .single();

  if (!article) notFound();

  const searchParamsData = await searchParams;

  const handleUpdate = updatePressArticle.bind(null, article.id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">언론보도 수정</h1>
      {searchParamsData.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {searchParamsData.error}
        </div>
      )}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <PressArticleForm
          mode="edit"
          action={handleUpdate}
          initialData={article}
        />
      </div>
    </div>
  );
}
