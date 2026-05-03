"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "image";
  placeholder?: string;
};

type Item = Record<string, string>;

export default function ListEditor({
  name,
  defaultValue,
  fields,
  itemLabel = "항목",
  fixedCount,
}: {
  name: string;
  defaultValue: Item[];
  fields: FieldDef[];
  itemLabel?: string;
  // 고정 개수 모드 (예: 3단 정보) — 추가/삭제 버튼 숨김
  fixedCount?: number;
}) {
  const initial: Item[] = (() => {
    if (fixedCount) {
      const arr = [...defaultValue];
      while (arr.length < fixedCount) {
        arr.push(emptyItem(fields));
      }
      return arr.slice(0, fixedCount);
    }
    return defaultValue;
  })();

  const [items, setItems] = useState<Item[]>(initial);

  function update(idx: number, key: string, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  }

  function add() {
    setItems((prev) => [...prev, emptyItem(fields)]);
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length === 0 && !fixedCount && (
        <p className="text-sm text-stone-500 italic px-3 py-6 text-center bg-stone-50 rounded">
          등록된 {itemLabel}이(가) 없습니다.
        </p>
      )}

      {items.map((item, i) => (
        <div
          key={i}
          className="border border-stone-200 rounded-lg p-3 bg-stone-50/50 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              {itemLabel} {i + 1}
            </span>
            {!fixedCount && (
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="px-2 py-0.5 border border-stone-300 rounded disabled:opacity-30 hover:bg-white"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="px-2 py-0.5 border border-stone-300 rounded disabled:opacity-30 hover:bg-white"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="px-2 py-0.5 border border-red-300 text-red-700 rounded hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "textarea" || field.type === "image"
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <label className="block text-xs text-stone-600 mb-1">
                  {field.label}
                </label>
                <FieldInput
                  field={field}
                  value={item[field.name] ?? ""}
                  onChange={(v) => update(i, field.name, v)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {!fixedCount && (
        <button
          type="button"
          onClick={add}
          className="w-full py-2 border-2 border-dashed border-stone-300 text-stone-600 rounded hover:border-emerald-500 hover:text-emerald-700 text-sm"
        >
          + {itemLabel} 추가
        </button>
      )}
    </div>
  );
}

function emptyItem(fields: FieldDef[]): Item {
  return Object.fromEntries(fields.map((f) => [f.name, ""]));
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className="w-full px-2 py-1.5 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    );
  }
  if (field.type === "image") {
    return (
      <ImageInput
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="w-full px-2 py-1.5 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  );
}

function ImageInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("로그인이 필요합니다");
        return;
      }
      const ext = (file.name.match(/\.([a-zA-Z0-9]{1,8})$/)?.[1] ?? "bin").toLowerCase();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data, error: upErr } = await supabase.storage
        .from("uploads")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      const { data: pub } = supabase.storage
        .from("uploads")
        .getPublicUrl(data.path);
      onChange(pub.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-12 w-12 object-cover rounded border border-stone-200 shrink-0"
          />
        ) : (
          <div className="h-12 w-12 rounded border border-dashed border-stone-300 bg-stone-50 shrink-0" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "이미지 URL"}
          className="flex-1 min-w-0 px-2 py-1.5 border border-stone-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <label className="text-xs px-2 py-1.5 border border-stone-300 rounded cursor-pointer hover:bg-stone-100 whitespace-nowrap">
          {uploading ? "업로드 중..." : "📷 업로드"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
