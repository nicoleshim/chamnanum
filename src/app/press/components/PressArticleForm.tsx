"use client";

import { useState } from "react";

export type PressArticleFormProps = {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    id: number;
    title: string;
    source_name: string;
    reporter?: string | null;
    published_date?: string | null;
    url: string;
    summary?: string | null;
  };
};

export default function PressArticleForm({
  mode,
  action,
  initialData,
}: PressArticleFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await action(formData);
    } finally {
      setSubmitting(false);
    }
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">언론사</label>
          <input
            type="text"
            name="source_name"
            defaultValue={initialData?.source_name ?? ""}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">기자명</label>
          <input
            type="text"
            name="reporter"
            defaultValue={initialData?.reporter ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">게재일</label>
        <input
          type="date"
          name="published_date"
          defaultValue={initialData?.published_date ?? ""}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">원문 URL</label>
        <input
          type="url"
          name="url"
          defaultValue={initialData?.url ?? ""}
          required
          placeholder="https://"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">요약</label>
        <textarea
          name="summary"
          defaultValue={initialData?.summary ?? ""}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "저장 중..." : mode === "create" ? "작성" : "수정"}
      </button>
    </form>
  );
}
