'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Trophy, Award, Menu } from 'lucide-react';

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Programmes', href: '/programs', icon: Calendar },
    { label: 'Results', href: '/results', icon: Trophy },
    { label: 'Leaderboard', href: '/leaderboard', icon: Award },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-emerald-950/95 border-t border-emerald-800/80 backdrop-blur-xl px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10 font-black scale-105'
                  : 'text-emerald-300/80 hover:text-emerald-100 font-bold'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center py-1 px-3 rounded-2xl text-emerald-300/80 hover:text-emerald-100 font-bold transition-all"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        )}
      </div>
    </div>
  );
}
