'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ConnectionStatusBadge } from '@/components/ConnectionStatusBadge';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { 
  Gavel, 
  LayoutDashboard, 
  BookOpen, 
  Bell, 
  User, 
  LogOut 
} from 'lucide-react';

function JudgeLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminProfile, logout } = useAuth();

  // If on login page, render child directly
  if (pathname === '/judge/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/judge/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/judge/dashboard', icon: LayoutDashboard },
    { label: 'Programmes', path: '/judge/programmes', icon: BookOpen },
    { label: 'Notifications', path: '/judge/notifications', icon: Bell },
    { label: 'Profile', path: '/judge/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col pb-20 sm:pb-0">
      
      {/* Judge Header */}
      <header className="sticky top-0 z-40 bg-emerald-950/90 border-b border-emerald-800/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-emerald-100 flex items-center gap-1.5">
              <span>Official Judge Panel</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
                Judge Mode
              </span>
            </h1>
            <p className="text-[11px] text-emerald-300/80">
              {adminProfile?.name_en || 'Event Judge'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionStatusBadge />
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-all text-xs font-bold flex items-center gap-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Android Bottom Navigation Bar (360px - 412px target) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 border-t border-emerald-800/80 backdrop-blur-xl px-2 py-2 sm:hidden flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/judge/dashboard' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
                isActive 
                  ? 'bg-amber-500 text-emerald-950 font-black shadow-lg' 
                  : 'text-emerald-400 hover:text-emerald-100 hover:bg-emerald-900/40'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-extrabold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <JudgeLayoutInner>{children}</JudgeLayoutInner>
    </AuthProvider>
  );
}
