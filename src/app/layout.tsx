import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const description = "BlackSmile Cloud — store, organize, and share your files from anywhere.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.blacksmile.co.kr"),
  title: {
    default: "BlackSmile Cloud",
    template: "%s · BlackSmile Cloud",
  },
  description,
  applicationName: "BlackSmile Cloud",
  alternates: {
    canonical: "https://www.blacksmile.co.kr",
  },
  openGraph: {
    title: "BlackSmile Cloud",
    description,
    siteName: "BlackSmile Cloud",
    type: "website",
    locale: "en_US",
    url: "https://www.blacksmile.co.kr",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlackSmile Cloud",
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
