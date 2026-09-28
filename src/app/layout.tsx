import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { BrandMark } from "@/components/BrandMark";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { WinkIntro } from "@/components/WinkIntro";
import "./globals.css";

const sans = Noto_Sans_KR({
  variable: "--font-sans-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const preferredRegion = ["icn1"];

export const viewport: Viewport = {
  themeColor: "#07070a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blacksmile.co.kr"),
  title: {
    default: "blacksmile",
    template: "%s · blacksmile",
  },
  description: "blacksmile — 어둠 속의 미소. 팔로우 없이, 오늘 밤만.",
  applicationName: "blacksmile",
  openGraph: {
    title: "blacksmile",
    description: "어둠 속의 미소. 팔로우 없이, 오늘 밤만.",
    siteName: "blacksmile",
    type: "website",
    locale: "ko_KR",
    url: "https://www.blacksmile.co.kr",
  },
  twitter: {
    card: "summary_large_image",
    title: "blacksmile",
    description: "어둠 속의 미소. 팔로우 없이, 오늘 밤만.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-night text-paper">
        <WinkIntro />
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 md:pb-6">
            {children}
          </main>
          <BottomNav />
        </Providers>
        <footer className="border-t border-line py-8 text-center text-xs text-mute">
          <BrandMark className="text-sm font-semibold" />
          <p className="mt-2 tracking-tight text-mute">
            어둠 속의 미소 · 오늘 밤만
          </p>
        </footer>
      </body>
    </html>
  );
}
