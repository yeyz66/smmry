import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Smmry: AI Article Summarizer - Summarize Articles Quickly",
  description: "Use Smmry, the advanced AI article summarizer, to summarize articles and text instantly. Get a concise summarize of article content in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 