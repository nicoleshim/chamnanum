import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllPagesTree, type MenuNode } from "@/lib/pages";
import AdminNav from "@/components/AdminNav";
import { deletePage } from "./actions";

export default async function AdminPagesIndex() {
  const data = await getCurrentUser();
  if (!data?.user) redirect("/login");
  if (data.profile?.role !== "admin") redirect("/");

  const tree = await getAllPagesTree();

  return (
    <div>
      <AdminNav active="/admin/pages" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">페이지 / 메뉴 관리</h1>
          <p className="text-sm text-stone-500 mt-1">
            상위 페이지는 헤더 메뉴로 표시되며, 하위 페이지는 드롭다운으로
            나타납니다. 정렬 순서가 작을수록 먼저 표시됩니다.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm whitespace-nowrap"
        >
          새 페이지
        </Link>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {tree.length > 0 ? (
          <ul className="divide-y divide-stone-100">
            {tree.map((node) => (
              <PageRow key={node.id} node={node} parentSlugs={[]} depth={0} />
            ))}
          </ul>
        ) : (
          <p className="p-10 text-center text-stone-500">
            등록된 페이지가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

function PageRow({
  node,
  parentSlugs,
  depth,
}: {
  node: MenuNode;
  parentSlugs: string[];
  depth: number;
}) {
  const url = "/" + [...parentSlugs, node.slug].join("/");
  const handleDelete = deletePage.bind(null, node.id);

  return (
    <>
      <li
        className="flex items-center gap-3 p-3 hover:bg-stone-50"
        style={{ paddingLeft: 12 + depth * 24 }}
      >
        <span className="text-stone-400 text-xs">
          {depth > 0 ? "└" : "■"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{node.title}</span>
            {!node.is_published && (
              <span className="text-[10px] px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded">
                비공개
              </span>
            )}
          </div>
          <div className="text-xs text-stone-500 mt-0.5 font-mono">
            {url}
            {node.link_override && (
              <span className="ml-2 text-emerald-700">
                → {node.link_override}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-stone-400 hidden sm:inline">
          순서 {node.sort_order}
        </span>
        <Link
          href={`/admin/pages/${node.id}`}
          className="text-xs px-2 py-1 border border-stone-300 rounded hover:bg-stone-100"
        >
          편집
        </Link>
        <form action={handleDelete}>
          <button
            type="submit"
            className="text-xs px-2 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
          >
            삭제
          </button>
        </form>
      </li>
      {node.children.map((child) => (
        <PageRow
          key={child.id}
          node={child}
          parentSlugs={[...parentSlugs, node.slug]}
          depth={depth + 1}
        />
      ))}
    </>
  );
}
