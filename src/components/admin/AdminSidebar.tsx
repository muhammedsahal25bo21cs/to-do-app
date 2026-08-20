'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IslamicCrescentLogo } from '@/components/IslamicCrescentLogo';
import { 
  LayoutDashboard, 
  Info, 
  Settings, 
  Compass, 
  Layers, 
  Users, 
  Shield, 
  CheckSquare, 
  FolderTree, 
  Calendar, 
  Award, 
  Trophy, 
  Palette, 
  BarChart2, 
  Megaphone, 
  Image as ImageIcon, 
  MapPin, 
  UserCog, 
  History, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Star,
  ExternalLink,
  BookOpen,
  Radio,
  QrCode,
  Activity
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  roles?: string[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function AdminSidebar({
  isMobileOpen = false,
  onCloseMobile = () => {},
  userRole = 'super_admin'
}: {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  userRole?: string;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const rawGroups: NavGroup[] = [
    {
      group: 'Dashboard & Live Desk',
      items: [
        { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
        { label: '🔴 Live Control Center', path: '/admin/live', icon: Radio },
      ],
    },
    {
      group: 'Event Identity',
      items: [
        { label: 'Event Settings', path: '/admin/event', icon: Info },
        { label: 'Branding & Theme', path: '/admin/settings', icon: Settings },
        { label: 'Navigation Links', path: '/admin/navigation', icon: Compass },
        { label: 'Homepage Layout', path: '/admin/sections', icon: Layers },
      ],
    },
    {
      group: 'People & Rosters',
      items: [
        { label: 'Students Roster', path: '/admin/students', icon: Users },
        { label: 'House Teams', path: '/admin/teams', icon: Shield },
        { label: 'Attendance Desk', path: '/admin/registrations', icon: CheckSquare },
      ],
    },
    {
      group: 'Competition Engine',
      items: [
        { label: 'Categories', path: '/admin/categories', icon: FolderTree },
        { label: 'Programmes Schedule', path: '/admin/programmes', icon: Calendar },
        { label: 'Registrations', path: '/admin/registrations', icon: CheckSquare },
        { label: 'Attendance Control', path: '/admin/attendance', icon: CheckSquare },
        { label: 'Mobile QR Scanner', path: '/admin/attendance/scan', icon: QrCode },
      ],
    },
    {
      group: 'Scoring & Audit',
      items: [
        { label: 'Score Entry Panel', path: '/admin/scores', icon: Award },
        { label: 'Score Verification Audit', path: '/admin/scores/judge', icon: ShieldCheck },
        { label: 'Rankings Generation', path: '/admin/results', icon: Trophy },
      ],
    },
    {
      group: 'Results & Posters',
      items: [
        { label: 'Results & Winners', path: '/admin/results', icon: Trophy },
        { label: 'Certificate Studio', path: '/admin/certificates', icon: Award },
        { label: 'Poster Studio', path: '/admin/results/poster-studio', icon: Palette },
        { label: 'Sharing & QR Desk', path: '/admin/sharing', icon: QrCode },
        { label: 'Published Results', path: '/results', icon: ExternalLink },
      ],
    },
    {
      group: 'Leaderboard System',
      items: [
        { label: 'Student Leaderboard', path: '/leaderboard', icon: BarChart2 },
        { label: 'Team Leaderboard', path: '/points', icon: Shield },
        { label: 'Point Allocation Rules', path: '/admin/event', icon: BookOpen },
      ],
    },
    {
      group: 'Media & Venue',
      items: [
        { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
        { label: 'Gallery Showcase', path: '/admin/gallery', icon: ImageIcon },
        { label: 'Guests & Speakers', path: '/admin/speakers', icon: MapPin },
      ],
    },
    {
      group: 'Administration',
      items: [
        { label: 'Admin Users & Roles', path: '/admin/users', icon: UserCog, roles: ['super_admin'] },
        { label: 'System Health & Audit', path: '/admin/system/health', icon: Activity, roles: ['super_admin'] },
        { label: 'Link & QR Checker', path: '/admin/system/links', icon: Compass, roles: ['super_admin'] },
        { label: 'Activity Audit Logs', path: '/admin/logs', icon: History },
        { label: 'Setup Wizard', path: '/admin/setup', icon: Settings },
      ],
    },
  ];

  // Filter Nav Groups based on Admin Role
  const filteredGroups = rawGroups.map(grp => ({
    ...grp,
    items: grp.items.filter(item => !item.roles || item.roles.includes(userRole)),
  })).filter(grp => grp.items.length > 0);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-emerald-950/95 border-r border-emerald-800/50 p-4 flex flex-col justify-between shrink-0 backdrop-blur-xl transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div className="space-y-4">
          {/* Logo Header & Collapse Toggle */}
          <div className="pb-4 border-b border-emerald-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <IslamicCrescentLogo size="sm" />
              {!isCollapsed && (
                <div>
                  <span className="text-xs font-black text-amber-300 block">Milad CMS</span>
                  <span className="text-[9px] text-emerald-400 font-bold block uppercase tracking-wider">Control Desk</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border border-emerald-700/60 text-xs"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
            {filteredGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <span className="text-[10px] font-black uppercase text-amber-400/80 px-2 tracking-wider block">
                    {grp.group}
                  </span>
                )}
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-amber-500 text-emerald-950 shadow-md shadow-amber-500/20'
                          : 'text-emerald-300/80 hover:text-amber-300 hover:bg-emerald-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-950' : 'text-amber-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer info & Logged in Admin Profile */}
        <div className="pt-3 border-t border-emerald-800/40 space-y-2">
          {!isCollapsed ? (
            <div className="p-2 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] font-black text-amber-300 block truncate">{userRole || 'Super Admin'}</span>
                <span className="text-[9px] text-emerald-400 font-bold block truncate">Active Session</span>
              </div>

              <Link
                href="/admin/login"
                className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-bold shrink-0"
                title="Logout / Switch Account"
              >
                Exit
              </Link>
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto shadow-sm shadow-amber-400" />
          )}
        </div>
      </aside>
    </>
  );
}
