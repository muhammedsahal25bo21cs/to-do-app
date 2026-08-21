import type { Metadata } from 'next';
import { getSiteSettings, getProgrammes } from '@/lib/cmsService';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meelad-gold.vercel.app';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const slug = resolved.slug;

  const [settings, prgs] = await Promise.all([
    getSiteSettings(),
    getProgrammes(false, false),
  ]);

  const programme = prgs.find(p => p.slug === slug || p.id === slug);
  const eventName = settings.event_name_en || 'Milad Fest 2K26';
  const shareUrl = `${siteUrl}/programs/${slug}/register`;

  const programmeTitle = programme ? programme.title_en : slug.replace(/-/g, ' ').toUpperCase();
  const title = `Register for ${programmeTitle} — ${eventName}`;
  const description = `Register online for ${programmeTitle} (${programme?.venue || settings.venue_en}) on ${eventName} Portal.`;

  const shareImage =
    settings.seo_share_image_url ||
    settings.event_poster_url ||
    settings.hero_image_url ||
    '/og-image.png';

  return {
    title: title,
    description: description,
    openGraph: {
      title: `Register for ${programmeTitle}`,
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
      title: `Register for ${programmeTitle}`,
      description: description,
      images: [shareImage],
    },
  };
}

export default function ProgrammeDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
