import { createClient } from "@/lib/supabase/server";

export type SettingKey =
  | "home_hero_title"
  | "home_hero_subtitle"
  | "home_hero_image_url"
  | "home_body"
  | "home_featured_cards"
  | "home_quick_info"
  | "home_gallery"
  | "home_external_links_title"
  | "home_external_links_desc"
  | "home_external_links";

export type FeaturedCard = {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
};

export type QuickInfoItem = {
  title: string;
  body: string;
  link_url: string;
  link_text: string;
};

export type GalleryItem = {
  image_url: string;
  caption: string;
  link_url: string;
};

export type ExternalLink = {
  title: string;
  image_url: string;
  url: string;
};

const DEFAULT_QUICK_INFO: QuickInfoItem[] = [
  {
    title: "후원 안내",
    body: "정기 후원과 일회성 기부로 도움이 필요한 곳에 따뜻함을 전합니다.",
    link_url: "",
    link_text: "",
  },
  {
    title: "자원봉사 안내",
    body: "지역사회와 함께하는 봉사 활동에 동참해주세요.",
    link_url: "",
    link_text: "",
  },
  {
    title: "상담문의",
    body: "TEL. 052-000-0000\nE-mail. info@example.com",
    link_url: "",
    link_text: "",
  },
];

const DEFAULTS: Record<SettingKey, string> = {
  home_hero_title: "함께 나누는 따뜻한 마음",
  home_hero_subtitle:
    "참나눔회는 우리 사회의 소외된 이웃에게 사랑과 희망을 전하는 비영리 기부 단체입니다.",
  home_hero_image_url: "",
  home_body: "",
  home_featured_cards: "[]",
  home_quick_info: JSON.stringify(DEFAULT_QUICK_INFO),
  home_gallery: "[]",
  home_external_links_title: "공익위반제보",
  home_external_links_desc:
    "참나눔회는 공익사항을 준수하여 운영하고 있으며, 위반 사항이 있을 경우 아래 기관으로 제보해주시기 바랍니다.",
  home_external_links: "[]",
};

export async function getSettings(
  keys: SettingKey[],
): Promise<Record<SettingKey, string>> {
  const result = Object.fromEntries(
    keys.map((k) => [k, DEFAULTS[k]]),
  ) as Record<SettingKey, string>;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);

  if (error || !data) return result;
  for (const row of data) {
    if (row.key in result && row.value != null) {
      result[row.key as SettingKey] = row.value;
    }
  }
  return result;
}

export function parseJsonArray<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
