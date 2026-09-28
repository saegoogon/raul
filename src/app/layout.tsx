import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { BrandMark } from "@/components/BrandMark";
import { Header } from "@/components/Header";
import { WinkIntro } from "@/components/WinkIntro";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-night text-paper">
        <WinkIntro />
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-20 md:pb-6">
          {children}
        </main>
        <BottomNav />
        <footer className="border-t border-line py-8 text-center text-xs text-mute">
          <BrandMark className="text-sm font-semibold" />
          <p className="font-display mt-2 italic text-mute">
            a smile in the dark · one night only
          </p>
        </footer>
      </body>
    </html>
  );
}
