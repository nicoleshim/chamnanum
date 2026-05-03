"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
};

const safeExt = (name: string) => {
  const m = name.match(/\.([a-zA-Z0-9]{1,8})$/);
  return m ? m[1].toLowerCase() : "bin";
};

const randomSuffix = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36);

export default function RichEditor({
  name,
  defaultValue = "",
  rows = 12,
  required,
  placeholder,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  async function uploadFile(file: File): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요합니다");
      return null;
    }
    const path = `${user.id}/${Date.now()}-${randomSuffix()}.${safeExt(file.name)}`;
    const { data, error: upErr } = await supabase.storage
      .from("uploads")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });
    if (upErr) {
      setError(`업로드 실패: ${upErr.message}`);
      return null;
    }
    const { data: pub } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path);
    return pub.publicUrl;
  }

  function insertAtCursor(text: string) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    ta.value = before + text + after;
    const pos = start + text.length;
    ta.setSelectionRange(pos, pos);
    ta.focus();
  }

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        if (!url) continue;
        const isImage = file.type.startsWith("image/");
        const md = isImage
          ? `\n\n![${file.name}](${url})\n\n`
          : `\n\n[${file.name}](${url})\n\n`;
        insertAtCursor(md);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={`rounded border ${
        isDragging ? "border-emerald-500 bg-emerald-50/30" : "border-stone-300"
      } overflow-hidden`}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setIsDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
          handleFiles(e.dataTransfer.files);
        }
      }}
    >
      <textarea
        ref={ref}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        required={required}
        placeholder={
          placeholder ??
          "내용을 입력하세요. 이미지는 복사 → 붙여넣기 (⌘V) 하거나 파일을 드래그하세요."
        }
        onPaste={(e) => {
          const items = e.clipboardData?.items;
          if (!items) return;
          const files: File[] = [];
          for (const item of Array.from(items)) {
            if (item.kind === "file") {
              const f = item.getAsFile();
              if (f) files.push(f);
            }
          }
          if (files.length > 0) {
            e.preventDefault();
            handleFiles(files);
          }
        }}
        className="w-full px-3 py-2 focus:outline-none resize-y block"
      />
      <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-t border-stone-200 text-sm">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-stone-600 hover:text-emerald-700"
        >
          📎 파일 첨부
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
        <span className="text-xs text-stone-500">
          {uploading
            ? "업로드 중..."
            : "이미지 붙여넣기 / 파일 드래그 가능"}
        </span>
      </div>
      {error && (
        <div className="px-3 py-2 bg-red-50 border-t border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
