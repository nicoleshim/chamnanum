import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllPagesTree } from "@/lib/pages";
import AdminNav from "@/components/AdminNav";
import PageForm from "@/components/PageForm";
import { createPage } from "../actions";

export default async function NewPagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/");

  const params = await searchParams;
  const tree = await getAllPagesTree();

  return (
    <div>
      <AdminNav active="/admin/pages" />
      <h1 className="text-2xl font-bold mb-6">새 페이지 등록</h1>
      {params.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {params.error}
        </div>
      )}
      <PageForm parentTree={tree} action={createPage} />
    </div>
  );
}
