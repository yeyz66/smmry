import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SMMRY: AI Article Summarizer | Summarize Articles in Seconds",
  description: "SMMRY is a powerful AI article summarizer that helps you summarize any article, website or text quickly. Get concise summaries with our free tool - just paste and click to summarize it!",
  keywords: "smmry, article summarizer, summarize article, summarize of article, website summarizer, summarize it, summarise articles, summarize this article, summarize an article, summarize articles, summarize my article",
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
    description: "SMMRY is a powerful AI article summarizer that helps you summarize any article, website or text quickly. Get concise summaries with our free tool - just paste and click to summarize it!",
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
    description: "SMMRY is a powerful AI article summarizer that helps you summarize any article, website or text quickly. Get concise summaries with our free tool - just paste and click to summarize it!",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NRSD3TEM2V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NRSD3TEM2V');
          `}
        </Script>
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "SMMRY Article Summarizer",
                "applicationCategory": "WebApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "SMMRY is a powerful AI article summarizer that helps you summarize any article, website or text quickly. Get concise summaries with our free tool.",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "124"
                }
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 