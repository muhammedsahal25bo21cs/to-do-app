'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScheduleRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/programs');
  }, [router]);

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center text-xs font-extrabold text-amber-300">
      Redirecting to Official Programmes Schedule...
    </div>
  );
}
