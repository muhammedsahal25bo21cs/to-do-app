import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/cmsService';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meelad-gold.vercel.app';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const eventName = settings.event_name_en || 'Milad Fest 2K26';
  const shareUrl = `${siteUrl}/programs`;

  const title = `Programmes & Registrations — ${eventName}`;
  const description = `Explore competition categories, schedules, and registration rosters for ${eventName}.`;

  const shareImage =
    settings.seo_share_image_url ||
    settings.event_poster_url ||
    settings.hero_image_url ||
    '/og-image.png';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      url: shareUrl,
      siteName: eventName,
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
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [shareImage],
    },
  };
}

export default function ProgramsDirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
