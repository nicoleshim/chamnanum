"use client";

import { useEffect, useState } from "react";

export type Announcement = {
  id: number;
  title: string;
  content: string;
};

export default function AnnouncementPopup({
  announcement,
}: {
  announcement: Announcement;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = `announcement_popup_${announcement.id}`;

  useEffect(() => {
    // 로컬스토리지에서 "다시 보지 않기" 상태 확인
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [announcement.id, storageKey]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {announcement.title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition ml-2 text-2xl leading-none"
            aria-label="Close popup"
          >
            ×
          </button>
        </div>

        <div className="mb-6 text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
          {announcement.content}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
          >
            닫기
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
          >
            다시 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
