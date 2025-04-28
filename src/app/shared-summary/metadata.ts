import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shared Article Summary | SMMRY Article Summarizer Results",
  description: "View a shared article summary created with SMMRY's AI-powered article summarizer. See how our tool can summarize articles, websites and text effectively.",
  keywords: "shared summary, article summary, smmry share, article summarizer results, summarize article example, website summarizer example, summarise articles",
  alternates: {
    canonical: "https://aismmry.com/shared-summary",
  },
  openGraph: {
    title: "Shared Article Summary | SMMRY Article Summarizer Results",
    description: "View a shared article summary created with SMMRY's AI-powered article summarizer. See how our tool can summarize articles, websites and text effectively.",
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