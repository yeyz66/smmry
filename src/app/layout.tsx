import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SMMRY: AI Article Summarizer | Summarize Articles in Seconds",
  description: "SMMRY is a powerful AI article summarizer tool that helps you summarize any article or text quickly. Get concise summaries with our free article summarizer.",
  keywords: "smmry, summarize, article summarizer, summarize article, summarize of article, text summarizer, AI summarizer",
  authors: [{ name: "SMMRY Team" }],
  creator: "SMMRY",
  publisher: "SMMRY",
  icons: {
    icon: [
      { url: '/favicon.svg' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ],
  },
  openGraph: {
    title: "SMMRY: AI Article Summarizer | Summarize Articles in Seconds",
    description: "SMMRY is a powerful AI article summarizer tool that helps you summarize any article or text quickly. Get concise summaries with our free article summarizer.",
    url: "https://aismmry.com",
    siteName: "SMMRY",
    images: [
      {
        url: "https://aismmry.com/api/og",
        width: 1200,
        height: 630,
        alt: "SMMRY - AI Article Summarizer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SMMRY: AI Article Summarizer | Summarize Articles in Seconds",
    description: "SMMRY is a powerful AI article summarizer tool that helps you summarize any article or text quickly. Get concise summaries with our free article summarizer.",
    images: ["https://aismmry.com/api/og"],
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon links are now handled through the metadata object above */}
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 