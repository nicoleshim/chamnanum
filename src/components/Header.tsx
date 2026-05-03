import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/(auth)/actions";
import { getNavTree } from "@/lib/pages";
import { buildNavItems } from "@/lib/nav";
import NavMenu from "./NavMenu";

export default async function Header() {
  const [data, tree] = await Promise.all([getCurrentUser(), getNavTree()]);
  const user = data?.user;
  const profile = data?.profile;
  const isAdmin = profile?.role === "admin";

  const items = buildNavItems(tree);

  return (
    <header className="border-b border-stone-200 bg-white relative z-40">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xl font-bold text-emerald-700 whitespace-nowrap"
        >
          참나눔회
        </Link>
        <div className="flex items-center gap-1 flex-wrap">
          <NavMenu items={items} />
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-2 text-sm rounded hover:bg-stone-100 text-emerald-700 font-medium"
            >
              관리자
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="text-stone-600 hidden sm:inline">
                {profile?.display_name ?? user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded border border-stone-300 hover:bg-stone-100"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded border border-stone-300 hover:bg-stone-100"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
