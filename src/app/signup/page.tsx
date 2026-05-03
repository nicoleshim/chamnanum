import Link from "next/link";
import { signUp } from "@/app/(auth)/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl border border-stone-200 p-8">
      <h1 className="text-2xl font-bold mb-2">회원가입</h1>
      <p className="text-sm text-stone-500 mb-6">
        참나눔회의 따뜻한 활동에 함께해주세요.
      </p>

      {params.error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {params.error}
        </div>
      )}

      <form action={signUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">이름</label>
          <input
            name="display_name"
            type="text"
            required
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
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
          <label className="block text-sm font-medium mb-1">
            비밀번호 (6자 이상)
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
        >
          회원가입
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-stone-600">
        이미 회원이신가요?{" "}
        <Link href="/login" className="text-emerald-700 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
