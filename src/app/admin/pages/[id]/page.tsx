import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllPagesTree, type Page } from "@/lib/pages";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/AdminNav";
import PageForm from "@/components/PageForm";
import { updatePage } from "../actions";

export default async function EditPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/");

  const { id } = await params;
  const sp = await searchParams;
  const pageId = Number(id);
  if (!Number.isFinite(pageId)) notFound();

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .single<Page>();

  if (!page) notFound();

  const tree = await getAllPagesTree();
  const action = updatePage.bind(null, page.id);

  return (
    <div>
      <AdminNav active="/admin/pages" />
      <h1 className="text-2xl font-bold mb-6">페이지 편집</h1>
      {sp.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {sp.error}
        </div>
      )}
      <PageForm
        page={page}
        parentTree={tree}
        action={action}
        excludeId={page.id}
      />
    </div>
  );
}
