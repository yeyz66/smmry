import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings | SMMRY Article Summarizer",
  description: "Manage your SMMRY account settings and preferences for the AI-powered article summarizer tool.",
  keywords: "account settings, smmry settings, article summarizer settings, user preferences",
  alternates: {
    canonical: "https://aismmry.com/settings",
  },
  openGraph: {
    title: "Account Settings | SMMRY Article Summarizer",
    description: "Manage your SMMRY account settings and preferences for the AI-powered article summarizer tool.",
    url: "https://aismmry.com/settings",
    siteName: "SMMRY",
    images: [
      {
        url: "https://aismmry.com/api/og?type=settings&title=Account%20Settings",
        width: 1200,
        height: 630,
        alt: "SMMRY Account Settings",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}; 