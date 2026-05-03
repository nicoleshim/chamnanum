import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getSettings,
  parseJsonArray,
  type FeaturedCard,
  type QuickInfoItem,
  type GalleryItem,
  type ExternalLink,
} from "@/lib/settings";
import Markdown from "@/components/Markdown";

export default async function HomePage() {
  const supabase = await createClient();

  const [settings, { data: announcements }] = await Promise.all([
    getSettings([
      "home_hero_title",
      "home_hero_subtitle",
      "home_hero_image_url",
      "home_body",
      "home_featured_cards",
      "home_quick_info",
      "home_gallery",
      "home_external_links_title",
      "home_external_links_desc",
      "home_external_links",
    ]),
    supabase
      .from("announcements")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const featuredCards = parseJsonArray<FeaturedCard>(
    settings.home_featured_cards,
  );
  const quickInfo = parseJsonArray<QuickInfoItem>(settings.home_quick_info);
  const gallery = parseJsonArray<GalleryItem>(settings.home_gallery);
  const externalLinks = parseJsonArray<ExternalLink>(
    settings.home_external_links,
  );

  const heroBg = settings.home_hero_image_url
    ? {
        backgroundImage: `linear-gradient(rgba(4,120,87,0.7), rgba(6,78,59,0.85)), url(${settings.home_hero_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <div className="space-y-12">
      {/* 1. Hero */}
      <section
        style={heroBg}
        className={`text-white rounded-2xl p-10 sm:p-16 ${
          settings.home_hero_image_url
            ? ""
            : "bg-gradient-to-br from-emerald-600 to-emerald-800"
        }`}
      >
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">
          {settings.home_hero_title}
        </h1>
        <p className="text-lg sm:text-xl text-emerald-50 mb-8 max-w-2xl whitespace-pre-line">
          {settings.home_hero_subtitle}
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/announcements"
            className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-medium hover:bg-emerald-50"
          >
            공지사항 보기
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-900 border border-emerald-500"
          >
            회원 가입
          </Link>
        </div>
      </section>

      {/* 2. 사업 소개 카드 */}
      {featuredCards.length > 0 && (
        <section>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(${
                featuredCards.length <= 3 ? "260px" : "220px"
              }, 1fr))`,
            }}
          >
            {featuredCards.map((card, i) => (
              <FeaturedCardItem key={i} card={card} />
            ))}
          </div>
        </section>
      )}

      {/* 3. 3단 정보 */}
      {quickInfo.some((q) => q.title || q.body) && (
        <section className="grid sm:grid-cols-3 gap-4">
          {quickInfo.map((item, i) =>
            !item.title && !item.body ? null : (
              <QuickInfoCard key={i} item={item} />
            ),
          )}
        </section>
      )}

      {/* 4. 본문 (선택) */}
      {settings.home_body && (
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8">
          <Markdown content={settings.home_body} />
        </section>
      )}

      {/* 5. 공지사항 */}
      <section className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">공지사항</h2>
          <Link
            href="/announcements"
            className="text-sm text-emerald-700 hover:underline"
          >
            더보기 →
          </Link>
        </div>
        {announcements && announcements.length > 0 ? (
          <ul className="divide-y divide-stone-100">
            {announcements.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/announcements/${a.id}`}
                  className="flex justify-between items-center py-3 hover:bg-stone-50 px-2 -mx-2 rounded gap-3"
                >
                  <span className="truncate">{a.title}</span>
                  <span className="text-xs text-stone-500 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-500 py-6 text-center">
            등록된 공지가 없습니다.
          </p>
        )}
      </section>

      {/* 6. 활동사진 */}
      {gallery.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4">활동사진</h2>
          <div className="overflow-x-auto -mx-4 px-4 pb-2 snap-x snap-mandatory">
            <div className="flex gap-3">
              {gallery.map((g, i) => (
                <GalleryCard key={i} item={g} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. 공익위반제보 / 외부 링크 */}
      {externalLinks.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-2">
            {settings.home_external_links_title}
          </h2>
          {settings.home_external_links_desc && (
            <p className="text-sm text-stone-600 mb-4 whitespace-pre-line">
              {settings.home_external_links_desc}
            </p>
          )}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
            }}
          >
            {externalLinks.map((l, i) => (
              <ExternalLinkButton key={i} item={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FeaturedCardItem({ card }: { card: FeaturedCard }) {
  const inner = (
    <>
      <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
        {card.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image_url}
            alt={card.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200" />
        )}
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-bold text-stone-900 mb-1">{card.title}</h3>
        {card.subtitle && (
          <p className="text-xs text-stone-600 leading-relaxed">
            {card.subtitle}
          </p>
        )}
      </div>
    </>
  );

  const cls =
    "block group rounded-xl overflow-hidden border border-stone-200 hover:shadow-lg transition-shadow";

  if (card.link_url) {
    return isExternal(card.link_url) ? (
      <a
        href={card.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {inner}
      </a>
    ) : (
      <Link href={card.link_url} className={cls}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

function QuickInfoCard({ item }: { item: QuickInfoItem }) {
  const inner = (
    <div className="bg-white border border-stone-200 rounded-xl p-6 h-full">
      <h3 className="text-emerald-700 font-bold text-lg mb-2">{item.title}</h3>
      {item.body && (
        <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
          {item.body}
        </p>
      )}
      {item.link_url && (
        <div className="mt-3">
          <span className="inline-block text-emerald-700 text-sm hover:underline">
            {item.link_text || "자세히 보기"} →
          </span>
        </div>
      )}
    </div>
  );

  if (item.link_url) {
    return isExternal(item.link_url) ? (
      <a
        href={item.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-90"
      >
        {inner}
      </a>
    ) : (
      <Link href={item.link_url} className="block hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return inner;
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const inner = (
    <div className="snap-start shrink-0 w-[260px] rounded-lg overflow-hidden border border-stone-200 bg-white">
      <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.caption || ""}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        )}
      </div>
      {item.caption && (
        <div className="px-3 py-2 text-xs text-stone-700 truncate">
          {item.caption}
        </div>
      )}
    </div>
  );

  if (item.link_url) {
    return isExternal(item.link_url) ? (
      <a href={item.link_url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    ) : (
      <Link href={item.link_url}>{inner}</Link>
    );
  }
  return inner;
}

function ExternalLinkButton({ item }: { item: ExternalLink }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition"
    >
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt=""
          className="w-12 h-12 object-contain shrink-0"
        />
      ) : (
        <div className="w-12 h-12 bg-stone-100 rounded shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-800 text-sm">{item.title}</div>
        <div className="text-xs text-stone-500 mt-0.5">바로가기 →</div>
      </div>
    </a>
  );
}

function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
