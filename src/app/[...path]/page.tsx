import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { resolvePageByPath, type Page } from "@/lib/pages";
import Markdown from "@/components/Markdown";

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const result = await resolvePageByPath(path);
  if (!result) notFound();

  const { page, ancestors, children, siblings } = result;
  const baseSlugs = ancestors.map((a) => a.slug);
  const ownPath = "/" + [...baseSlugs, page.slug].join("/");

  // 메뉴 그룹 용도 페이지 (link_override 가 있으면 즉시 이동)
  if (page.link_override) redirect(page.link_override);

  // 자식이 있는 부모 페이지는 첫 자식으로 이동
  if (children.length > 0) {
    redirect(ownPath + "/" + children[0].slug);
  }

  return (
    <article className="max-w-4xl mx-auto">
      {ancestors.length > 0 && (
        <nav className="text-sm text-stone-500 mb-4 flex items-center gap-1.5 flex-wrap">
          {ancestors.map((a, i) => (
            <span key={a.id} className="flex items-center gap-1.5">
              <Link
                href={firstChildHref(a, ancestors.slice(0, i))}
                className="hover:text-emerald-700"
              >
                {a.title}
              </Link>
              <span className="text-stone-300">/</span>
            </span>
          ))}
          <span className="text-stone-700">{page.title}</span>
        </nav>
      )}

      <header className="mb-6 pb-4 border-b border-stone-200">
        <h1 className="text-3xl font-bold">{page.title}</h1>
      </header>

      <div className="grid md:grid-cols-[200px_1fr] gap-6">
        {siblings.length > 1 ? (
          <aside className="md:sticky md:top-4 md:self-start">
            <nav className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              {siblings.map((s) => {
                const href =
                  "/" + [...baseSlugs, s.slug].join("/");
                const isActive = s.id === page.id;
                return (
                  <Link
                    key={s.id}
                    href={href}
                    className={`block px-4 py-3 text-sm border-l-2 ${
                      isActive
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-medium"
                        : "border-transparent text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {s.title}
                  </Link>
                );
              })}
            </nav>
          </aside>
        ) : (
          <div className="hidden md:block" />
        )}

        <div>
          {page.content ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <Markdown content={page.content} />
            </div>
          ) : (
            <p className="text-stone-500 text-center py-12 bg-white border border-stone-200 rounded-xl">
              이 페이지의 내용이 아직 작성되지 않았습니다.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

// breadcrumb 의 ancestor 링크 — link_override 있으면 그쪽, 없으면 자기 자신
function firstChildHref(node: Page, beforeAncestors: Page[]): string {
  if (node.link_override) return node.link_override;
  return "/" + [...beforeAncestors.map((a) => a.slug), node.slug].join("/");
}
