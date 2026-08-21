import type { Metadata } from 'next';
import { getSiteSettings, getCertificateById } from '@/lib/cmsService';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meelad-gold.vercel.app';

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const id = resolved.id;

  const [settings, cert] = await Promise.all([
    getSiteSettings(),
    getCertificateById(id),
  ]);

  const eventName = settings.event_name_en || 'Milad Fest 2K26';
  const shareUrl = `${siteUrl}/verify/${id}`;

  const recipientName = cert ? cert.recipient_name : 'Participant';
  const programmeTitle = cert ? cert.programme_title : 'Milad Fest';

  const title = `Certificate Verification: ${recipientName} — ${eventName}`;
  const description = `Verify official certificate awarded to ${recipientName} for ${programmeTitle} on ${eventName}.`;

  const shareImage =
    settings.certificate_bg_url ||
    settings.seo_share_image_url ||
    settings.event_poster_url ||
    '/og-image.png';

  return {
    title: title,
    description: description,
    openGraph: {
      title: `Certificate Verification: ${recipientName}`,
      description: description,
      type: 'article',
      url: shareUrl,
      siteName: eventName,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `Certificate Verification for ${recipientName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Certificate Verification: ${recipientName}`,
      description: description,
      images: [shareImage],
    },
  };
}

export default function CertificateVerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
