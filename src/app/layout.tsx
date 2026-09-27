import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/posts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "blacksmile",
    template: "%s · blacksmile",
  },
  description: "Share any photo. Share your day. A worldwide feed of ordinary moments.",
  openGraph: {
    title: "blacksmile",
    description: "Share any photo. Share your day.",
    siteName: "blacksmile",
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-100 text-zinc-900">
        <Header user={user} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
          blacksmile · share your day with the world
        </footer>
      </body>
    </html>
  );
}
