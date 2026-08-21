import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const id = resolved.id || 'result';

  return {
    title: `Official Programme Result — Milad Fest 2K26`,
    description: `Official Published Competition Result Poster for programme ${id} on Milad Fest 2K26 Portal.`,
    openGraph: {
      title: `Official Programme Result — Milad Fest 2K26`,
      description: `View official winner announcements and E-Poster on Milad Fest 2K26.`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Official Programme Result — Milad Fest 2K26`,
      description: `View official winner announcements on Milad Fest 2K26.`,
    },
  };
}

export default function ProgrammeResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
