'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedCard } from '@/components/admin/AccessDeniedCard';
import { Loader2 } from 'lucide-react';

interface AdminPermissionGuardProps {
  children: React.ReactNode;
  featureKey?: string;
  featureLabel?: string;
  programmeId?: string;
  categoryId?: string;
}

export function AdminPermissionGuard({
  children,
  featureKey,
  featureLabel,
  programmeId,
  categoryId,
}: AdminPermissionGuardProps) {
  const { isAdminAuthenticated, isLoading, hasPermission, canManageProgramme } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoading, isAdminAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-amber-400 gap-3 font-bold text-xs">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span>Verifying Security Session & Role Permissions...</span>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  // Feature permission check
  if (featureKey && !hasPermission(featureKey)) {
    return <AccessDeniedCard requiredFeature={featureLabel || featureKey} />;
  }

  // Programme assignment check
  if (programmeId && !canManageProgramme(programmeId, categoryId)) {
    return <AccessDeniedCard requiredFeature="this assigned programme score sheet" />;
  }

  return <>{children}</>;
}
