import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programme: string; category: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const programmeTitle = (resolved.programme || 'Programme').replace(/-/g, ' ').toUpperCase();
  const categoryName = (resolved.category || 'General').replace(/-/g, ' ').toUpperCase();

  return {
    title: `${programmeTitle} (${categoryName}) — Milad Fest 2K26 Official Result`,
    description: `Official Published Competition Result Poster for ${programmeTitle} (${categoryName}) on Milad Fest 2K26 Portal.`,
    openGraph: {
      title: `${programmeTitle} (${categoryName}) — Milad Fest 2K26 Result`,
      description: `View official winner announcements and E-Poster for ${programmeTitle} (${categoryName}) on Milad Fest 2K26.`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${programmeTitle} (${categoryName}) — Milad Fest 2K26 Result`,
      description: `View official winner announcements for ${programmeTitle} on Milad Fest 2K26.`,
    },
  };
}

export default function ResultCategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
