import type { MenuNode } from "@/lib/pages";

export type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

// 부모 노드의 클릭 destination 결정:
// 1. link_override 가 있으면 그 URL
// 2. published 자식이 있으면 첫 번째 자식
// 3. 없으면 자기 자신
function resolveHref(node: MenuNode, ancestorSlugs: string[] = []): string {
  if (node.link_override) return node.link_override;
  const firstChild = node.children.find((c) => c.is_published);
  if (firstChild) {
    return (
      "/" + [...ancestorSlugs, node.slug, firstChild.slug].join("/")
    );
  }
  return "/" + [...ancestorSlugs, node.slug].join("/");
}

export function buildNavItems(tree: MenuNode[]): NavItem[] {
  return tree.map((node) => ({
    href: resolveHref(node),
    label: node.title,
    children:
      node.children.length > 0
        ? node.children.map((c) => ({
            href: resolveHref(c, [node.slug]),
            label: c.title,
          }))
        : undefined,
  }));
}
