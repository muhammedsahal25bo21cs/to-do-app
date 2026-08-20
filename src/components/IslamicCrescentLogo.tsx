import React from 'react';
import Link from 'next/link';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const IslamicCrescentLogo: React.FC<Props> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link href="/" className="flex items-center gap-3 group">
      {/* Decorative Crescent & Lantern Badge */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300`}>
        <div className="w-full h-full bg-emerald-950 rounded-full flex items-center justify-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent" />
          
          {/* SVG Crescent and Star */}
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 fill-amber-400 relative z-10 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-7.54-7.54A9.03 9.03 0 0 0 12 3z" />
            <path d="M19 4.5l.62 1.38L21 6.5l-1.38.62L19 8.5l-.62-1.38L17 6.5l1.38-.62z" />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold ${titleSizes[size]} text-gold-gradient tracking-wide`}>
            നബിദിനം
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
            1446
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-medium text-emerald-300/80 -mt-0.5 tracking-normal">
            മീലാദ് ഫെസ്റ്റ് & കലാസമ്മേളനം
          </span>
        )}
      </div>
    </Link>
  );
};
