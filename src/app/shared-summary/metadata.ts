import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shared Summary | SMMRY Article Summarizer",
  description: "View a shared article summary created with SMMRY's AI-powered article summarizer tool.",
  keywords: "shared summary, article summary, smmry share, article summarizer results",
  alternates: {
    canonical: "https://aismmry.com/shared-summary",
  },
  openGraph: {
    title: "Shared Summary | SMMRY Article Summarizer",
    description: "View a shared article summary created with SMMRY's AI-powered article summarizer tool.",
    url: "https://aismmry.com/shared-summary",
    siteName: "SMMRY",
    images: [
      {
        url: "https://aismmry.com/api/og?type=shared&title=Shared%20Summary",
        width: 1200,
        height: 630,
        alt: "SMMRY Shared Summary",
      },
    ],
    locale: "en_US",
    type: "article",
  },
}; 