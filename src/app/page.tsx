import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { Icon, Logo, type IconName } from "@/components/Icon";
import { getCurrentUser } from "@/lib/user";

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: "link", title: "Short links", body: "Turn any long URL into blacksmile.co.kr/l/… with your own code." },
  { icon: "user", title: "One page for all", body: "A clean link-in-bio page at blacksmile.co.kr/@you." },
  { icon: "chart", title: "Click analytics", body: "Daily clicks, referrers, countries, and devices for every link." },
  { icon: "edit", title: "Change anytime", body: "Edit destinations, pause links, and reorder without new URLs." },
];

const DEMO = ["Latest video", "Shop my picks", "Newsletter", "Book a call"];

export default async function Home({ searchParams }: PageProps<"/">) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { missing } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2.5 font-semibold">
          <Logo />
          <BrandMark /> <span className="text-mute">Links</span>
        </span>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Sign up free
          </Link>
        </nav>
      </header>

      {missing ? (
        <p className="mx-auto mt-2 rounded-full border border-line px-4 py-1.5 text-sm text-mute">
          That link doesn&apos;t exist or was paused.
        </p>
      ) : null}

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5">
        <section className="grid items-center gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="mb-5 inline-block rounded-full border border-line px-4 py-1.5 text-xs text-mute">
              Free while in beta
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Every link you share.
              <br />
              <span className="text-mute">Shorter, smarter, tracked.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-mute md:text-lg">
              Shorten URLs, build a link-in-bio page, and see exactly who clicks — all in one simple dashboard.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                Create free account
              </Link>
              <Link href="/login" className="btn-ghost px-6 py-3 text-base">
                Log in
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xs rounded-[2.5rem] border border-line bg-ink p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-2xl font-semibold text-night">
                B
              </div>
              <p className="mt-3 font-semibold">BlackSmile</p>
              <p className="text-xs text-mute">@blacksmile</p>
            </div>
            <ul className="mt-6 flex flex-col gap-2.5">
              {DEMO.map((title) => (
                <li key={title} className="rounded-2xl border border-line bg-night px-4 py-3 text-center text-sm">
                  {title}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-3 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-night">
                <Icon name={feature.icon} size={20} />
              </div>
              <h2 className="font-medium">{feature.title}</h2>
              <p className="mt-1.5 text-sm text-mute">{feature.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-mute">© BlackSmile</footer>
    </div>
  );
}
