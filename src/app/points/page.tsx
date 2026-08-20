'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PointsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/leaderboard?tab=teams');
  }, [router]);

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center text-xs font-extrabold text-amber-300">
      Redirecting to Official Team Leaderboard...
    </div>
  );
}
