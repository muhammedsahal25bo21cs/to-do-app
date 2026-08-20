'use client';

import React, { useEffect, useState } from 'react';
import { getSections, getSiteSettings, EventSection, SiteSettings } from '@/lib/cmsService';
import { HeaderNav } from '@/components/HeaderNav';
import { HeroSection } from '@/components/HeroSection';
import { AnnouncementsSection } from '@/components/AnnouncementsSection';
import { CountdownSection } from '@/components/CountdownSection';
import { AboutSection } from '@/components/AboutSection';
import { ProgrammeSection } from '@/components/ProgrammeSection';
import { ResultsPreviewSection } from '@/components/ResultsPreviewSection';
import { LeaderboardPreviewSection } from '@/components/LeaderboardPreviewSection';
import { SpeakersSection } from '@/components/SpeakersSection';
import { EventInfoSection } from '@/components/EventInfoSection';
import { ArabicDuroodSection } from '@/components/ArabicDuroodSection';
import { GallerySection } from '@/components/GallerySection';
import { LocationSection } from '@/components/LocationSection';
import { FooterSection } from '@/components/FooterSection';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { MaintenanceOverlay } from '@/components/MaintenanceOverlay';

export default function Home() {
  const [sections, setSections] = useState<EventSection[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      getSections(true),
      getSiteSettings(),
    ]).then(([s, stg]) => {
      setSections(s);
      setSettings(stg);
      setLoading(false);
    });
  }, []);

  if (settings?.is_maintenance_mode) {
    return <MaintenanceOverlay message={settings.maintenance_message} />;
  }

  const renderSectionByKey = (key: string) => {
    switch (key) {
      case 'hero':
        return <HeroSection key="hero" />;
      case 'announcements':
        return <AnnouncementsSection key="announcements" />;
      case 'countdown':
        return <CountdownSection key="countdown" />;
      case 'about':
        return <AboutSection key="about" />;
      case 'programmes':
        return <ProgrammeSection key="programmes" />;
      case 'results':
        return <ResultsPreviewSection key="results" />;
      case 'leaderboard':
        return <LeaderboardPreviewSection key="leaderboard" />;
      case 'speakers':
        return <SpeakersSection key="speakers" />;
      case 'durood':
        return <ArabicDuroodSection key="durood" />;
      case 'gallery':
        return <GallerySection key="gallery" />;
      case 'location':
        return <LocationSection key="location" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-emerald-950 text-emerald-100 pb-16 md:pb-0">
      <HeaderNav onOpenSearch={() => setSearchModalOpen(true)} />
      
      <main className="space-y-6">
        {sections.length > 0 ? (
          sections.map((sec) => renderSectionByKey(sec.section_key))
        ) : (
          <>
            <HeroSection />
            <AnnouncementsSection />
            <CountdownSection />
            <AboutSection />
            <ProgrammeSection />
            <ResultsPreviewSection />
            <LeaderboardPreviewSection />
            <SpeakersSection />
            <EventInfoSection />
            <ArabicDuroodSection />
            <GallerySection />
            <LocationSection />
          </>
        )}
      </main>

      <FooterSection />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
