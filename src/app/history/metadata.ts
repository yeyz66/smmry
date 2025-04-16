import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Summarization History | SMMRY Article Summarizer",
  description: "View and manage your history of article summaries created with SMMRY's AI-powered article summarizer tool.",
  keywords: "summary history, article history, smmry history, summarize article history, article summarizer history",
  alternates: {
    canonical: "https://aismmry.com/history",
  },
  openGraph: {
    title: "Your Summarization History | SMMRY Article Summarizer",
    description: "View and manage your history of article summaries created with SMMRY's AI-powered article summarizer tool.",
    url: "https://aismmry.com/history",
    siteName: "SMMRY",
    images: [
      {
        url: "https://aismmry.com/api/og?type=history&title=Summarization%20History",
        width: 1200,
        height: 630,
        alt: "SMMRY Summary History",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}; 