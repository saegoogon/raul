import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { Icon, type IconName } from "@/components/drive/Icon";
import { getCurrentUser } from "@/lib/user";

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: "upload", title: "Drag, drop, done", body: "Upload many files at once and watch each one finish." },
  { icon: "folder", title: "Folders that stay tidy", body: "Nest folders, rename, move, and search in a click." },
  { icon: "share", title: "Share with a link", body: "Turn on a link for any file or folder. Turn it off anytime." },
  { icon: "image", title: "Preview in place", body: "Open photos, video, audio, PDFs, and text without downloading." },
];

export default async function Home() {
  if (await getCurrentUser()) redirect("/drive");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-semibold">
          <Icon name="cloud" size={22} filled />
          <BrandMark /> <span className="text-mute">Cloud</span>
        </span>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5">
        <section className="flex flex-col items-center py-20 text-center md:py-28">
          <p className="mb-5 rounded-full border border-line px-4 py-1.5 text-xs text-mute">1 GB free for every account</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            All your files.
            <br />
            <span className="text-mute">One quiet place.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-mute md:text-lg">
            BlackSmile Cloud keeps your documents, photos, and projects safe, organized, and ready to share from any device.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Create free account
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-base">
              I already have one
            </Link>
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

      <footer className="border-t border-line py-6 text-center text-xs text-mute">
        © {new Date().getFullYear()} BlackSmile
      </footer>
    </div>
  );
}
