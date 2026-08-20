'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { GlobalSearchModal } from '@/components/admin/GlobalSearchModal';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-islamic-pattern text-emerald-100 flex flex-col">
        {/* Top Navigation Bar */}
        <AdminTopBar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Permanent Collapsible Sidebar & Mobile Drawer */}
          <AdminSidebar
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Main Work Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
            {/* Breadcrumb Trail Navigation */}
            <AdminBreadcrumbs />
            {children}
          </main>
        </div>

        {/* Global Admin Search Modal */}
        <GlobalSearchModal
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
        />
      </div>
    </AdminProtectedRoute>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
