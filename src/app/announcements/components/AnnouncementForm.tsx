"use client";

import { useState } from "react";
import RichEditor from "@/components/RichEditor";

export type AnnouncementFormProps = {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    id: number;
    title: string;
    content: string;
    is_popup?: boolean;
    popup_start_date?: string | null;
    popup_end_date?: string | null;
    popup_display_count?: number | null;
  };
};

export default function AnnouncementForm({
  mode,
  action,
  initialData,
}: AnnouncementFormProps) {
  const [isPopup, setIsPopup] = useState(initialData?.is_popup ?? false);
  const [popupStartDate, setPopupStartDate] = useState(
    initialData?.popup_start_date
      ? new Date(initialData.popup_start_date).toISOString().slice(0, 16)
      : ""
  );
  const [popupEndDate, setPopupEndDate] = useState(
    initialData?.popup_end_date
      ? new Date(initialData.popup_end_date).toISOString().slice(0, 16)
      : ""
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("is_popup", isPopup ? "true" : "false");
    if (isPopup) {
      formData.set("popup_start_date", popupStartDate);
      formData.set("popup_end_date", popupEndDate);
    }
    await action(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">제목</label>
        <input
          type="text"
          name="title"
          defaultValue={initialData?.title ?? ""}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">내용</label>
        <RichEditor 
          name="content" 
          defaultValue={initialData?.content ?? ""} 
          required 
        />
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={isPopup}
            onChange={(e) => setIsPopup(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">팝업으로 표시</span>
        </label>

        {isPopup && (
          <div className="space-y-3 pl-6 bg-gray-50 p-3 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">
                팝업 시작 날짜
              </label>
              <input
                type="datetime-local"
                value={popupStartDate}
                onChange={(e) => setPopupStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                비워두면 즉시 표시
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                팝업 종료 날짜
              </label>
              <input
                type="datetime-local"
                value={popupEndDate}
                onChange={(e) => setPopupEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                비워두면 무제한 표시
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
      >
        {mode === "create" ? "작성" : "수정"}
      </button>
    </form>
  );
}
