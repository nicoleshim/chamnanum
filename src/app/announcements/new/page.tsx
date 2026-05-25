import { redirect } from "next/navigation";
import { createAnnouncement } from "../actions";
import { getCurrentUser } from "@/lib/auth";
import AnnouncementForm from "../components/AnnouncementForm";

export default async function NewAnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/announcements");

  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 공지사항 작성</h1>
      {params.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {params.error}
        </div>
      )}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <AnnouncementForm mode="create" action={createAnnouncement} />
      </div>
    </div>
  );
}
