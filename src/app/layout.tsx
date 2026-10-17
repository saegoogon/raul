import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Noto_Sans_KR, Syne } from "next/font/google";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Providers } from "@/components/providers";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ui",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-code",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

const description = "BlackSmile. 개발자가 이야기하고 코드를 나누는 플랫폼.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blacksmile.co.kr"),
  title: {
    default: "BlackSmile",
    template: "%s · BlackSmile",
  },
  description,
  icons: {
    icon: [
      { url: "/favicon.ico?v=hood3", sizes: "any" },
      { url: "/favicon-16.png?v=hood3", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32.png?v=hood3", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png?v=hood3", type: "image/png", sizes: "256x256" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=hood3", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: "https://www.blacksmile.co.kr",
  },
  openGraph: {
    title: "BlackSmile",
    description,
    siteName: "BlackSmile",
    type: "website",
    locale: "ko_KR",
    url: "https://www.blacksmile.co.kr",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlackSmile",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${syne.variable} ${noto.variable} ${plex.variable} h-full`}>
      <body className={`${noto.className} flex min-h-full flex-col bg-night text-paper`}>
        <Providers>
          <SiteHeader />
          <div className="site-main" id="main">
            {children}
          </div>
          <SiteFooter />
          <SearchOverlay />
        </Providers>
      </body>
    </html>
  );
}
