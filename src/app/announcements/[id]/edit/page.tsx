import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import AnnouncementForm from "../../components/AnnouncementForm";
import { updateAnnouncement } from "../../actions";

export default async function EditAnnouncementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/announcements");

  const supabase = await createClient();
  const { data: announcement } = await supabase
    .from("announcements")
    .select("id, title, content, is_popup, popup_start_date, popup_end_date, popup_display_count")
    .eq("id", id)
    .single();

  if (!announcement) notFound();

  const searchParamsData = await searchParams;

  const handleUpdate = updateAnnouncement.bind(null, announcement.id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">공지사항 수정</h1>
      {searchParamsData.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {searchParamsData.error}
        </div>
      )}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <AnnouncementForm
          mode="edit"
          action={handleUpdate}
          initialData={announcement}
        />
      </div>
    </div>
  );
}
