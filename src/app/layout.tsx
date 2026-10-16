import type { Metadata, Viewport } from "next";
import { Fira_Code } from "next/font/google";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Providers } from "@/components/providers";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import "./globals.css";

const fira = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const description = "BlackSmile. A dark GitHub. Talk, paste, feel.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blacksmile.co.kr"),
  title: {
    default: "BlackSmile",
    template: "%s · BlackSmile",
  },
  description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "256x256" },
    ],
    apple: "/apple-icon.png",
  },
  alternates: {
    canonical: "https://www.blacksmile.co.kr",
  },
  openGraph: {
    title: "BlackSmile",
    description,
    siteName: "BlackSmile",
    type: "website",
    locale: "en_US",
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
    <html lang="en" className={`${fira.variable} h-full`}>
      <body className={`${fira.className} flex min-h-full flex-col bg-night text-paper`}>
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
