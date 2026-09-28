import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import { BrandMark } from "@/components/BrandMark";
import { Header } from "@/components/Header";
import { Mascot } from "@/components/Mascot";
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
  alternates: {
    canonical: "https://www.blacksmile.co.kr",
  },
  openGraph: {
    title: "blacksmile",
    description: "A smile in the dark. One night only.",
    siteName: "blacksmile",
    type: "website",
    locale: "en_US",
    url: "https://www.blacksmile.co.kr",
    images: [
      {
        url: "/brand/blacksmile-logo.png",
        width: 1024,
        height: 1024,
        alt: "blacksmile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "blacksmile",
    description: "A smile in the dark. One night only.",
    images: ["/brand/blacksmile-logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-night text-paper">
        <WinkIntro />
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24 md:pb-8">
            {children}
          </main>
          <BottomNav />
        </Providers>
        <footer className="border-t border-line/80 py-8 text-center text-xs text-mute">
          <Mascot size="sm" className="mx-auto" />
          <p className="mt-2 text-sm">
            <BrandMark />
          </p>
          <p className="mt-1">one night only</p>
        </footer>
      </body>
    </html>
  );
}
