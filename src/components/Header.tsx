import Link from "next/link";
import { signOut } from "@/actions/auth";
import type { User } from "@supabase/supabase-js";

export function Header({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-orange-600">
          라울
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/submit"
                className="rounded-full bg-orange-600 px-4 py-1.5 font-medium text-white hover:bg-orange-700"
              >
                글쓰기
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-zinc-600 hover:text-zinc-900"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-orange-600 px-4 py-1.5 font-medium text-white hover:bg-orange-700"
              >
                가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
