import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

import { getSiteSettings } from "@/lib/cmsService";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://meelad-gold.vercel.app";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const title = settings.seo_site_title || settings.event_name_en || "Milad Fest 2K26";
  const description =
    settings.seo_meta_description ||
    settings.description_en ||
    settings.event_subtitle_en ||
    "Grand Cultural & Spiritual Celebration of Mawlid-un-Nabi ﷺ. Live results, leaderboard, and certificate verification.";
  const shareImage =
    settings.seo_share_image_url ||
    settings.event_poster_url ||
    settings.hero_image_url ||
    "/og-image.png";
  const favicon = settings.favicon_url || "/favicon.ico";
  const eventName = settings.event_name_en || "Milad Fest 2K26";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${eventName}`,
    },
    description: description,
    keywords: [
      eventName,
      settings.venue_en || "Al Ihsan Madrassa",
      "Milad Fest",
      "Mawlid Fest",
      "Milad un Nabi",
      "Islamic Competition",
      "Madrassa Fest",
    ],
    authors: [{ name: settings.organizer_name_en || "Al Ihsan Sunni Madrassa, Karingari" }],
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: siteUrl,
      siteName: eventName,
      title: title,
      description: description,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [shareImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    icons: {
      icon: favicon,
      apple: "/apple-touch-icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-islamic-pattern min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-emerald-950">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
