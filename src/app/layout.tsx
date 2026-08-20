import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://meelad-2k26.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "റൗളത്തുൽ മദീന മീലാദ് ഫെസ്റ്റ് - 2K26 | Rowlathul Madeena Milad Fest",
    template: "%s | Milad Fest 2K26",
  },
  description:
    "August 29, Saturday at Al Ihsan Sunni Madrassa, Karingari. Grand Cultural & Spiritual Celebration of Mawlid-un-Nabi ﷺ. Live results, leaderboard, and certificate verification.",
  keywords: [
    "Rowlathul Madeena",
    "Milad Fest 2026",
    "Karingari Milad",
    "Al Ihsan Madrassa",
    "Mawlid Fest",
    "Milad un Nabi",
    "Islamic Competition",
    "Madrassa Fest",
  ],
  authors: [{ name: "Al Ihsan Sunni Madrassa, Karingari" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Milad Fest 2K26",
    title: "റൗളത്തുൽ മദീന മീലാദ് ഫെസ്റ്റ് - 2K26 | Rowlathul Madeena Milad Fest",
    description:
      "August 29, Saturday · Al Ihsan Sunni Madrassa, Karingari. Grand Cultural & Spiritual Celebration of Mawlid-un-Nabi ﷺ.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Milad Fest 2K26 — Rowlathul Madeena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Milad Fest 2K26 | Rowlathul Madeena",
    description:
      "August 29 · Al Ihsan Sunni Madrassa, Karingari. Live results, leaderboard, and certificate verification.",
    images: ["/og-image.png"],
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
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

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
