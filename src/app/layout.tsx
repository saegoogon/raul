import type { Metadata, Viewport } from "next";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

export const preferredRegion = ["icn1"];

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blacksmile.co.kr"),
  title: {
    default: "BlackSmile",
    template: "%s · BlackSmile",
  },
  description: "BlackSmile — more fun together. One night only.",
  applicationName: "BlackSmile",
  alternates: {
    canonical: "https://www.blacksmile.co.kr",
  },
  openGraph: {
    title: "BlackSmile",
    description: "More fun together. One night only.",
    siteName: "BlackSmile",
    type: "website",
    locale: "en_US",
    url: "https://www.blacksmile.co.kr",
    images: [
      {
        url: "/brand/blacksmile-logo.png",
        width: 1024,
        height: 1024,
        alt: "BlackSmile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlackSmile",
    description: "More fun together. One night only.",
    images: ["/brand/blacksmile-logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-night text-paper">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
