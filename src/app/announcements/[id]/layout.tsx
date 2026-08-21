import type { Metadata } from 'next';
import { getSiteSettings, getAnnouncements } from '@/lib/cmsService';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meelad-gold.vercel.app';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const id = resolved.id;

  const [settings, anns] = await Promise.all([
    getSiteSettings(),
    getAnnouncements(true),
  ]);

  const announcement = anns.find(a => a.id === id);
  const eventName = settings.event_name_en || 'Milad Fest 2K26';
  const shareUrl = `${siteUrl}/announcements/${id}`;

  const title = announcement
    ? `${announcement.title_en} — ${eventName}`
    : `Live Announcement — ${eventName}`;

  const description =
    announcement?.short_description_en ||
    (announcement?.content_en ? announcement.content_en.substring(0, 160) : '') ||
    settings.seo_meta_description ||
    settings.description_en ||
    'Official Live Festival Announcement';

  const shareImage =
    settings.seo_share_image_url ||
    settings.event_poster_url ||
    settings.hero_image_url ||
    '/og-image.png';

  return {
    title: title,
    description: description,
    openGraph: {
      title: announcement ? announcement.title_en : 'Live Announcement',
      description: description,
      type: 'article',
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
      title: announcement ? announcement.title_en : 'Live Announcement',
      description: description,
      images: [shareImage],
    },
  };
}

export default function AnnouncementDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
