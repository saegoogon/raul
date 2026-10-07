import type { Metadata, Viewport } from "next";
import { CartFlash } from "@/components/cart/CartFlash";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Providers } from "@/components/providers";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  colorScheme: "dark",
};

const description = "BlackSmile. Objects for the dark, with a mouth.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blacksmile.co.kr"),
  title: {
    default: "BlackSmile",
    template: "%s · BlackSmile",
  },
  description,
  icons: {
    icon: "/favicon.ico",
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
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-night text-paper">
        <Providers>
          <SiteHeader />
          <div className="site-main" id="main">
            {children}
          </div>
          <SiteFooter />
          <SearchOverlay />
          <CartFlash />
        </Providers>
      </body>
    </html>
  );
}
