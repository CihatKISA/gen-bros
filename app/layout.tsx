import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/src/components/layout/Header";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Content Topic Generator",
  description: "Generate engaging social media content topics powered by AI",
  keywords: ["AI", "content", "social media", "topic generator", "ChatGPT"],
  authors: [{ name: "AI Topic Generator" }],
  openGraph: {
    title: "AI Content Topic Generator",
    description: "Generate engaging social media content topics powered by AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
