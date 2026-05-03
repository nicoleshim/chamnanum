import type { Page, MenuNode } from "@/lib/pages";
import RichEditor from "./RichEditor";

type Option = { id: number; title: string; depth: number };

function flatten(tree: MenuNode[], depth = 0, out: Option[] = []): Option[] {
  for (const n of tree) {
    out.push({ id: n.id, title: n.title, depth });
    if (n.children.length) flatten(n.children, depth + 1, out);
  }
  return out;
}

export default function PageForm({
  page,
  parentTree,
  action,
  excludeId,
}: {
  page?: Page;
  parentTree: MenuNode[];
  action: (formData: FormData) => Promise<void>;
  excludeId?: number;
}) {
  const options = flatten(parentTree).filter((o) => o.id !== excludeId);

  return (
    <form
      action={action}
      className="bg-white rounded-xl border border-stone-200 p-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">제목 (메뉴 라벨)</label>
        <input
          name="title"
          required
          defaultValue={page?.title ?? ""}
          className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            URL slug{" "}
            <span className="text-xs text-stone-500 font-normal">
              (영문/숫자/하이픈)
            </span>
          </label>
          <input
            name="slug"
            required
            pattern="[a-z0-9][a-z0-9-]*"
            placeholder="예: greeting"
            defaultValue={page?.slug ?? ""}
            className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            정렬 순서{" "}
            <span className="text-xs text-stone-500 font-normal">
              (작을수록 먼저)
            </span>
          </label>
          <input
            name="sort_order"
            type="number"
            defaultValue={page?.sort_order ?? 0}
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">상위 메뉴</label>
        <select
          name="parent_id"
          defaultValue={page?.parent_id?.toString() ?? ""}
          className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">— 최상위 메뉴 —</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {"  ".repeat(o.depth)}
              {o.depth > 0 && "└ "}
              {o.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          링크 우회{" "}
          <span className="text-xs text-stone-500 font-normal">
            (선택 — 메뉴 클릭 시 이 URL 로 바로 이동. 예: /announcements)
          </span>
        </label>
        <input
          name="link_override"
          type="text"
          placeholder="비워두면 일반 페이지로 동작"
          defaultValue={page?.link_override ?? ""}
          className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          내용{" "}
          <span className="text-xs text-stone-500 font-normal">
            (마크다운 지원 — 자식 페이지가 있으면 첫 자식으로 자동 이동하므로 무시됨)
          </span>
        </label>
        <RichEditor name="content" defaultValue={page?.content ?? ""} rows={14} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="is_published"
          type="checkbox"
          defaultChecked={page?.is_published ?? true}
          className="w-4 h-4"
        />
        공개 (체크 해제 시 메뉴와 페이지가 회원에게 보이지 않음)
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <a
          href="/admin/pages"
          className="px-4 py-2 border border-stone-300 rounded hover:bg-stone-100"
        >
          취소
        </a>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          {page ? "저장" : "등록"}
        </button>
      </div>
    </form>
  );
}
