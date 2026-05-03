import Link from "next/link";
import { signIn } from "@/app/(auth)/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; signup?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl border border-stone-200 p-8">
      <h1 className="text-2xl font-bold mb-2">로그인</h1>
      <p className="text-sm text-stone-500 mb-6">
        참나눔회 회원이신가요? 로그인 후 회원게시판을 이용하세요.
      </p>

      {params.signup === "ok" && (
        <div className="mb-4 p-3 rounded bg-emerald-50 text-emerald-800 text-sm">
          회원가입이 완료되었습니다. 로그인해주세요.
        </div>
      )}
      {params.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {params.error}
        </div>
      )}

      <form action={signIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">이메일</label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">비밀번호</label>
          <input
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
        >
          로그인
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-stone-600">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="text-emerald-700 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
