import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Icon, Logo } from "@/components/Icon";
import { signOut } from "@/actions/auth";
import { installerInfo } from "@/lib/agent-download";
import { getCurrentUser } from "@/lib/user";

export default async function Home({ searchParams }: PageProps<"/">) {
  const user = await getCurrentUser();
  const installer = installerInfo();
  const params = await searchParams;
  const needInstaller = params.need === "1" || params["need-installer"] === "1";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <span className="flex items-center gap-2 text-sm">
          <Logo size={20} />
          <BrandMark />
        </span>
        <nav className="flex items-center gap-1">
          {user ? (
            <form action={signOut}>
              <button type="submit" className="btn-ghost">
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="btn-ghost">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col justify-between px-6 pb-10 md:px-10">
        <section className="mt-16 flex max-w-lg items-start justify-between gap-10 md:mt-24">
          <div>
            <p className="text-sm text-mute">Windows program</p>
            <h1 className="mt-3 text-[1.75rem] font-medium leading-snug">BlackSmile AI</h1>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-mute">
              Blacky lives on this PC. Chat with him, keep memories on the machine, and let him open a few apps after you say yes.
            </p>

            {needInstaller && !installer ? (
              <p className="mt-6 text-sm text-warn">
                The installer is not on this server yet. Build it with <code className="text-paper">npm run pack</code> in{" "}
                <code className="text-paper">desktop/</code>.
              </p>
            ) : null}

            <div className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-3">
              <a href="/download/windows" className="btn-primary">
                <Icon name="download" size={16} />
                Download
              </a>
              <span className="text-sm text-mute">{installer ? `${installer.sizeLabel} · .exe` : "Windows 10 / 11"}</span>
            </div>
          </div>
          <svg className="mt-8 hidden shrink-0 text-paper md:block" width="36" height="24" viewBox="0 0 18 12" aria-hidden>
            <circle cx="4" cy="3" r="1.4" fill="currentColor" />
            <circle cx="14" cy="3" r="1.4" fill="currentColor" />
            <path d="M4 8c2.2 2.4 7.8 2.4 10 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </section>

        <ul className="mt-24 max-w-sm space-y-1.5 text-sm text-mute">
          <li>Chats and memory stay on this computer.</li>
          <li>Notepad, Calculator, Paint, Explorer, browser, if you allow it.</li>
          <li>Free while in beta.</li>
        </ul>
      </main>

      <footer className="px-6 py-5 text-xs text-mute md:px-10">BlackSmile</footer>
    </div>
  );
}
