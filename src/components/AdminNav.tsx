import Link from "next/link";

const items = [
  { href: "/admin", label: "회원 권한" },
  { href: "/admin/pages", label: "페이지 / 메뉴" },
  { href: "/admin/home", label: "메인 페이지" },
];

export default function AdminNav({ active }: { active: string }) {
  return (
    <nav className="mb-6 flex gap-1 border-b border-stone-200">
      {items.map((item) => {
        const isActive = item.href === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              isActive
                ? "border-emerald-600 text-emerald-700 font-medium"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
