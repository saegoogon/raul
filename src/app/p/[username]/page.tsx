import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BrandMark } from "@/components/BrandMark";
import { isLinkScraper } from "@/lib/browser";
import { USERNAME_PATTERN, deviceOf, referrerOf, type PublicPage } from "@/lib/links";
import { createPublicClient } from "@/lib/supabase/public";

const loadPage = cache(async (username: string) => {
  const name = username.toLowerCase();
  if (!USERNAME_PATTERN.test(name)) return null;
  const { data } = await createPublicClient().rpc("public_page", { p_username: name });
  return (data as PublicPage | null) ?? null;
});

export async function generateMetadata({ params }: PageProps<"/p/[username]">): Promise<Metadata> {
  const page = await loadPage((await params).username);
  if (!page) return { title: "Not found" };
  const name = page.display_name || `@${page.username}`;
  return {
    title: name,
    description: page.bio || `${name} on BlackSmile Links`,
    alternates: { canonical: `/@${page.username}` },
  };
}

export default async function PublicProfile({ params }: PageProps<"/p/[username]">) {
  const page = await loadPage((await params).username);
  if (!page) notFound();

  const head = await headers();
  const ua = head.get("user-agent") ?? "";
  if (!isLinkScraper(ua)) {
    const host = head.get("host") ?? "";
    const referrer = referrerOf(head.get("referer"), host.split(":")[0]);
    const country = head.get("x-vercel-ip-country");
    after(async () => {
      await createPublicClient().rpc("record_page_view", {
        p_username: page.username,
        p_referrer: referrer,
        p_country: country,
        p_device: deviceOf(ua),
      });
    });
  }

  const name = page.display_name || page.username;
  return (
    <div className="flex min-h-dvh flex-col items-center px-5 py-14">
      <div className="flex w-full max-w-md flex-1 flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-paper text-4xl font-semibold uppercase text-night">
          {name.slice(0, 1)}
        </div>
        <h1 className="mt-5 text-2xl font-semibold">{name}</h1>
        <p className="text-sm text-mute">@{page.username}</p>
        {page.bio ? <p className="mt-4 whitespace-pre-line text-center text-sm text-paper/80">{page.bio}</p> : null}

        <ul className="mt-9 flex w-full flex-col gap-3">
          {page.links.map((link) => (
            <li key={link.slug}>
              <a
                href={`/l/${link.slug}?s=page`}
                rel="noopener"
                className="block w-full rounded-2xl border border-line bg-ink px-5 py-4 text-center font-medium transition-colors hover:border-paper hover:bg-paper hover:text-night"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
        {page.links.length === 0 ? <p className="mt-6 text-sm text-mute">No links yet.</p> : null}
      </div>

      <Link href="/" className="mt-14 text-xs text-mute hover:text-paper">
        Made with <BrandMark /> Links
      </Link>
    </div>
  );
}
