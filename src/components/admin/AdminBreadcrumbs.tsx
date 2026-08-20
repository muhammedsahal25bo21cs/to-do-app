'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const PATH_LABELS: Record<string, string> = {
  admin: 'Admin',
  event: 'Event Settings',
  settings: 'Branding & Settings',
  navigation: 'Navigation Links',
  sections: 'Homepage Sections',
  students: 'Students',
  teams: 'Teams',
  categories: 'Categories',
  programmes: 'Programmes',
  registrations: 'Registrations & Attendance',
  scores: 'Score Entry',
  judge: 'Score Verification',
  results: 'Results & Rankings',
  'poster-studio': 'Poster Studio',
  announcements: 'Announcements',
  gallery: 'Gallery',
  speakers: 'Speakers & Guests',
  users: 'Admin Users',
  logs: 'Activity Audit Logs',
  setup: 'Event Setup Wizard',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === '/admin/login') return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  let currentPath = '';

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-emerald-400/80 mb-6 flex-wrap font-semibold">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-amber-300 transition-colors text-emerald-300"
      >
        <Home className="w-3.5 h-3.5 text-amber-400" />
        <span>Dashboard</span>
      </Link>

      {segments.map((seg, index) => {
        if (seg === 'admin' && index === 0) return null;

        currentPath += `/${seg}`;
        const isLast = index === segments.length - 1;
        const label = PATH_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        return (
          <React.Fragment key={currentPath}>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {isLast ? (
              <span className="text-amber-300 font-bold underline decoration-amber-500/40 underline-offset-4">
                {label}
              </span>
            ) : (
              <Link
                href={currentPath.startsWith('/admin') ? currentPath : `/admin${currentPath}`}
                className="hover:text-amber-300 transition-colors text-emerald-300/80"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
