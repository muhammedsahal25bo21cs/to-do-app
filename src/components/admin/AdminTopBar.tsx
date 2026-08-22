'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSiteSettings, SiteSettings } from '@/lib/cmsService';
import { 
  Bell, 
  Search, 
  UserCheck, 
  LogOut, 
  ExternalLink, 
  CheckCheck, 
  ShieldCheck, 
  Menu, 
  X,
  Sparkles,
  ChevronDown,
  User,
  Settings
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export function AdminTopBar({ 
  onToggleMobileMenu, 
  onOpenGlobalSearch 
}: { 
  onToggleMobileMenu: () => void;
  onOpenGlobalSearch: () => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Scores Pending Verification',
      message: '3 score entries awaiting administrator audit verification.',
      time: '10 mins ago',
      read: false,
      type: 'warning',
    },
    {
      id: 'n2',
      title: 'Programme Completed',
      message: 'Sub-Junior Quran Recitation scores entered cleanly.',
      time: '1 hour ago',
      read: false,
      type: 'info',
    },
    {
      id: 'n3',
      title: 'Result Published',
      message: 'Official result poster published for Islamic Quiz Junior.',
      time: '2 hours ago',
      read: true,
      type: 'success',
    },
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSiteSettings);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <header className="bg-emerald-950/95 border-b border-emerald-800/60 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
      {/* Left: Mobile Menu Toggle & Event Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-emerald-900/60 text-emerald-300 border border-emerald-800"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
            ☪️
          </div>
          <div>
            <h1 className="text-sm font-black text-emerald-100 leading-none">
              {siteSettings?.event_name_en || 'Milad Fest 2K26'}
            </h1>
            <p className="text-[10px] text-amber-400 font-bold mt-0.5">Admin Management Console</p>
          </div>
        </div>
      </div>

      {/* Middle: Global Search Trigger Button */}
      <button
        onClick={onOpenGlobalSearch}
        className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-900/50 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-inner transition-all w-64 justify-between"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-amber-400" />
          <span>Global Search...</span>
        </span>
        <kbd className="px-1.5 py-0.5 rounded bg-emerald-950 text-amber-300 text-[10px] font-mono border border-emerald-800">
          Ctrl+K
        </kbd>
      </button>

      {/* Right: Notifications, Public View & Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Icon Button */}
        <button
          onClick={onOpenGlobalSearch}
          className="sm:hidden p-2 rounded-xl bg-emerald-900/60 text-amber-400 border border-emerald-800"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 relative transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-emerald-950 text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-emerald-950 border-2 border-emerald-800 rounded-3xl shadow-2xl p-4 space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-emerald-100">Admin Event Alerts</h3>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                      n.read
                        ? 'bg-emerald-950 border-emerald-900/60 opacity-60'
                        : 'bg-emerald-900/50 border-emerald-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-300">{n.title}</span>
                      <span className="text-[10px] text-emerald-400/60">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-emerald-200/80">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sync Laptop Data to Mobile / Public Server Button */}
        <button
          onClick={async () => {
            const mod = await import('@/lib/cmsService');
            const res = await mod.syncAllLaptopDataToServer();
            if (res.success) {
              const c = res.counts || {};
              alert(`✅ Successfully synced laptop Admin data to Supabase and live server!\n\nSynced to all mobile devices:\n• ${c.students || 0} Students\n• ${c.programmes || 0} Programmes\n• ${c.teams || 0} Teams\n• ${c.categories || 0} Categories\n\nAll mobile phones and shared public links now show your live data!`);
            } else {
              alert('⚠️ Failed to sync data to server.');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black shadow-md transition-all shrink-0"
          title="Sync Laptop Admin Data to Live Website & Mobile Devices"
        >
          <span>Sync to Mobile</span>
        </button>

        {/* Public Website Shortcut */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-800 transition-colors"
        >
          <span>View Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </a>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-800 transition-all text-xs font-bold text-emerald-100"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:inline-block max-w-[100px] truncate">{user?.email?.split('@')[0] || 'Admin'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-emerald-950 border-2 border-emerald-800 rounded-3xl shadow-2xl p-3 space-y-2 z-50">
              <div className="p-2 rounded-2xl bg-emerald-900/40 border border-emerald-800">
                <p className="text-xs font-black text-amber-300 truncate">{user?.email || 'Admin User'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  Super Administrator
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-800/60 space-y-1">
                <Link
                  href="/admin/users"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 hover:text-amber-300 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Permissions</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 hover:text-amber-300 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>Event Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
