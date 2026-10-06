import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  colorScheme: "dark",
};

const description = "Download BlackSmile AI, a desktop companion named Blacky for Windows.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blacksmile.co.kr"),
  title: {
    default: "BlackSmile AI",
    template: "%s · BlackSmile AI",
  },
  description,
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.blacksmile.co.kr",
  },
  openGraph: {
    title: "BlackSmile AI",
    description,
    siteName: "BlackSmile AI",
    type: "website",
    locale: "en_US",
    url: "https://www.blacksmile.co.kr",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlackSmile AI",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-night text-paper">{children}</body>
    </html>
  );
}
