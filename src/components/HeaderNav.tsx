'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavigationItems, getSiteSettings, NavigationItem, SiteSettings } from '@/lib/cmsService';
import { Menu, X, ChevronDown, Search } from 'lucide-react';

import { EventUpdatesBanner } from '@/components/EventUpdatesBanner';

export const HeaderNav: React.FC<{ onOpenSearch?: () => void }> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getNavigationItems(true).then(setNavItems);
    getSiteSettings().then(setSettings);
  }, []);

  const pageVis = settings?.public_pages_visibility;

  const defaultNavLinks = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'programs', label: 'Programmes', href: '/programs', condition: pageVis?.programs !== false },
    { key: 'participants', label: 'Participants', href: '/participants', condition: settings?.is_participants_section_enabled },
    { key: 'results', label: 'Results', href: '/results', condition: pageVis?.results !== false },
    { key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard', condition: pageVis?.leaderboard !== false },
    { key: 'announcements', label: 'Announcements', href: '/announcements', condition: pageVis?.announcements !== false },
    { key: 'gallery', label: 'Gallery', href: '/gallery', condition: pageVis?.gallery !== false },
    { key: 'venue', label: 'Venue', href: '/#location', condition: pageVis?.venue !== false },
    { key: 'about', label: 'About', href: '/#about' },
  ];

  const displayedItems = navItems.length > 0
    ? navItems.map(item => ({
        label: item.label_en,
        href: item.href || item.target_section || '/',
      }))
    : defaultNavLinks.filter(item => item.condition !== false);

  const primaryLinks = displayedItems.slice(0, 5);
  const secondaryLinks = displayedItems.slice(5);

  return (
    <>
      <EventUpdatesBanner />
      <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/40 shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-10 h-10 rounded-2xl object-cover border border-amber-500/40" />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-amber-400" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-7.54-7.54A9.03 9.03 0 0 0 12 3z" />
                    <path d="M19 4.5l.62 1.38L21 6.5l-1.38.62L19 8.5l-.62-1.38L17 6.5l1.38-.62z" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-gold-gradient tracking-wide">
                  {settings?.event_name_en || 'Milad Fest'}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  2K26
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-300/80 -mt-0.5">
                {settings?.event_subtitle_en || 'Annual Fest Portal'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links & Search */}
          <div className="hidden lg:flex items-center space-x-3">
            <nav className="flex items-center space-x-1">
              {primaryLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500 text-emerald-950 shadow-md'
                        : 'text-emerald-100 hover:text-amber-300 hover:bg-emerald-900/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* "More ▾" Dropdown */}
              {secondaryLinks.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100 hover:text-amber-300 hover:bg-emerald-900/60 transition-all"
                  >
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  {moreDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-emerald-950 border border-emerald-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-fade-in">
                      {secondaryLinks.map((link, idx) => (
                        <Link
                          key={idx}
                          href={link.href}
                          onClick={() => setMoreDropdownOpen(false)}
                          className="block px-3 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-amber-300 hover:bg-emerald-900/80 transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-700 text-amber-300 hover:bg-emerald-800 transition-all"
                title="Search Event Database"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Menu & Search Buttons */}
          <div className="flex items-center gap-2 lg:hidden">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800/60 text-amber-300 hover:bg-emerald-800"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800/60 text-amber-300 hover:bg-emerald-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950/95 border-b border-emerald-800/60 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl animate-fadeIn">
          {displayedItems.map((link, idx) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-emerald-950'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-amber-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  </>
  );
};
