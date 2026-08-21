import type { Metadata } from 'next';
import { getSiteSettings, getProgrammes, getCategories } from '@/lib/cmsService';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meelad-gold.vercel.app';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programme: string; category: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const rawPrg = resolved.programme || 'programme';
  const rawCat = resolved.category || 'general';

  const [settings, prgs, cats] = await Promise.all([
    getSiteSettings(),
    getProgrammes(false, false),
    getCategories(),
  ]);

  const foundPrg = prgs.find(p => p.slug === rawPrg || p.id === rawPrg);
  const foundCat = cats.find(c => c.slug === rawCat || c.id === rawCat);

  const programmeTitle = foundPrg?.title_en || rawPrg.replace(/-/g, ' ').toUpperCase();
  const categoryName = foundCat?.name_en || rawCat.replace(/-/g, ' ').toUpperCase();
  const eventName = settings.event_name_en || 'Milad Fest 2K26';
  const shareUrl = `${siteUrl}/results/${rawPrg}/${rawCat}`;

  const shareImage =
    settings.result_poster_bg_url ||
    settings.seo_share_image_url ||
    settings.event_poster_url ||
    '/og-image.png';

  const title = `${programmeTitle} (${categoryName}) — Official Result Poster | ${eventName}`;
  const description = `Official Published Competition Result Poster for ${programmeTitle} (${categoryName}) on ${eventName} Portal.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: `${programmeTitle} (${categoryName}) — Official Result`,
      description: description,
      type: 'article',
      url: shareUrl,
      siteName: eventName,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${programmeTitle} (${categoryName}) Result Poster`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${programmeTitle} (${categoryName}) — Official Result`,
      description: description,
      images: [shareImage],
    },
  };
}

export default function ResultCategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
