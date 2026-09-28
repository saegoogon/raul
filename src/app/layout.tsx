import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import { BrandMark } from "@/components/BrandMark";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { WinkIntro } from "@/components/WinkIntro";
import "./globals.css";

export const preferredRegion = ["icn1"];

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blacksmile.co.kr"),
  title: {
    default: "blacksmile",
    template: "%s · blacksmile",
  },
  description: "blacksmile — a smile in the dark. One night only.",
  applicationName: "blacksmile",
  openGraph: {
    title: "blacksmile",
    description: "A smile in the dark. One night only.",
    siteName: "blacksmile",
    type: "website",
    locale: "en_US",
    url: "https://www.blacksmile.co.kr",
  },
  twitter: {
    card: "summary_large_image",
    title: "blacksmile",
    description: "A smile in the dark. One night only.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full"
    >
      <body className="flex min-h-full flex-col bg-night text-paper">
        <WinkIntro />
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-5 pb-20 md:pb-6">
            {children}
          </main>
          <BottomNav />
        </Providers>
        <footer className="border-t border-line py-6 text-center text-xs text-mute">
          <BrandMark className="text-sm" />
          <p className="mt-1">one night only</p>
        </footer>
      </body>
    </html>
  );
}
