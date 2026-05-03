import { createClient } from "@/lib/supabase/server";

export type Page = {
  id: number;
  parent_id: number | null;
  slug: string;
  title: string;
  content: string | null;
  link_override: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuNode = Page & { children: MenuNode[] };

// 헤더 네비게이션용 트리 (published only)
export async function getNavTree(): Promise<MenuNode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) return []; // pages 테이블이 없을 때 등 — 헤더는 정상 표시
  return buildTree((data ?? []) as Page[]);
}

// 관리자용: 모든 페이지 (비공개 포함)
export async function getAllPagesTree(): Promise<MenuNode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) return [];
  return buildTree((data ?? []) as Page[]);
}

function buildTree(rows: Page[]): MenuNode[] {
  const map = new Map<number, MenuNode>();
  const roots: MenuNode[] = [];
  for (const r of rows) {
    map.set(r.id, { ...r, children: [] });
  }
  for (const r of rows) {
    const node = map.get(r.id)!;
    if (r.parent_id == null) {
      roots.push(node);
    } else {
      const parent = map.get(r.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node); // orphan fallback
    }
  }
  return roots;
}

// path 배열 (예: ["about", "greeting"]) 을 순회하며 페이지를 찾음
export async function resolvePageByPath(path: string[]): Promise<{
  page: Page;
  ancestors: Page[];
  children: Page[];
  siblings: Page[];
} | null> {
  if (path.length === 0) return null;
  const supabase = await createClient();

  let parentId: number | null = null;
  const ancestors: Page[] = [];
  let current: Page | null = null;

  for (const segment of path) {
    const query = supabase
      .from("pages")
      .select("*")
      .eq("slug", segment)
      .limit(1);
    const { data } =
      parentId == null
        ? await query.is("parent_id", null)
        : await query.eq("parent_id", parentId);
    const row = data?.[0] as Page | undefined;
    if (!row) return null;
    if (current) ancestors.push(current);
    current = row;
    parentId = row.id;
  }

  if (!current) return null;

  const [{ data: childRows }, { data: siblingRows }] = await Promise.all([
    supabase
      .from("pages")
      .select("*")
      .eq("parent_id", current.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true }),
    current.parent_id != null
      ? supabase
          .from("pages")
          .select("*")
          .eq("parent_id", current.parent_id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true })
      : Promise.resolve({ data: [] as Page[] }),
  ]);

  return {
    page: current,
    ancestors,
    children: (childRows ?? []) as Page[],
    siblings: (siblingRows ?? []) as Page[],
  };
}

// 페이지의 전체 URL 경로 생성 (예: "/about/greeting")
export async function getPageUrl(pageId: number): Promise<string> {
  const supabase = await createClient();
  const segments: string[] = [];
  let id: number | null = pageId;
  while (id != null) {
    const { data }: { data: { slug: string; parent_id: number | null } | null } =
      await supabase
        .from("pages")
        .select("slug, parent_id")
        .eq("id", id)
        .single();
    if (!data) break;
    segments.unshift(data.slug);
    id = data.parent_id;
  }
  return "/" + segments.join("/");
}

export function urlForNode(
  node: MenuNode,
  ancestors: MenuNode[] = [],
): string {
  const slugs = [...ancestors.map((a) => a.slug), node.slug];
  return "/" + slugs.join("/");
}
