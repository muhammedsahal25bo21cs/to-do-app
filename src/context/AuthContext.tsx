'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { AdminRole, AdminProfile, getAdminProfiles } from '@/lib/cmsService';

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  'Super Admin': [
    'identity', 'branding', 'theme', 'visibility', 'homepage', 'nav', 
    'leaderboard', 'maintenance', 'audit', 'users', 'students', 'teams', 
    'programmes', 'registrations', 'scores', 'verify_scores', 'publish_results', 
    'posters', 'certificates', 'logs'
  ],
  'Event Manager': [
    'identity', 'branding', 'theme', 'visibility', 'homepage', 'nav', 
    'students', 'teams', 'programmes', 'registrations', 'attendance', 
    'announcements', 'gallery', 'logs'
  ],
  'Score Manager': [
    'scores', 'verify_scores', 'programmes_view', 'logs'
  ],
  'Result Manager': [
    'results', 'publish_results', 'posters', 'certificates', 'leaderboard', 'logs'
  ],
  'Check-in Staff': [
    'attendance', 'attendance_view', 'attendance_checkin', 'registrations_view', 'logs'
  ],
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  adminRole: AdminRole;
  assignedProgrammeIds: string[];
  assignedCategoryIds: string[];
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (featureKey: string) => boolean;
  canManageProgramme: (programmeId: string, categoryId?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage fallback for demo mode
    const demoAuth = localStorage.getItem('demo_admin_auth');
    const demoRole = (localStorage.getItem('demo_admin_role') as AdminRole) || 'Super Admin';

    if (demoAuth === 'true') {
      setIsAdminAuthenticated(true);
      setAdminProfile({
        id: 'demo-admin-id',
        email: 'admin@miladfest.com',
        name_en: 'System Administrator',
        role: demoRole,
        status: 'Active',
      });
    }

    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsAdminAuthenticated(true);
          fetchAdminProfile(session.user.email || '');
        } else if (demoAuth !== 'true') {
          setIsAdminAuthenticated(false);
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsAdminAuthenticated(true);
          fetchAdminProfile(session.user.email || '');
        } else if (localStorage.getItem('demo_admin_auth') !== 'true') {
          setIsAdminAuthenticated(false);
          setAdminProfile(null);
          setIsLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchAdminProfile = async (email: string) => {
    try {
      const profiles = await getAdminProfiles();
      const match = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (match) {
        if (match.status === 'Disabled') {
          await logout();
          alert('Your administrator account has been disabled by organizers.');
          return;
        }
        setAdminProfile(match);
      } else {
        // Default Super Admin profile
        setAdminProfile({
          id: 'user-' + Date.now(),
          email,
          name_en: email.split('@')[0],
          role: 'Super Admin',
          status: 'Active',
        });
      }
    } catch (e) {
      console.warn('Error fetching admin profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        setUser(data.user);
        setSession(data.session);
        setIsAdminAuthenticated(true);
        await fetchAdminProfile(data.user.email || '');
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Authentication failed.' };
      }
    }

    // Demo Local Preview Fallback
    if (email && pass) {
      localStorage.setItem('demo_admin_auth', 'true');
      setIsAdminAuthenticated(true);
      setAdminProfile({
        id: 'demo-admin-id',
        email,
        name_en: 'Administrator',
        role: 'Super Admin',
        status: 'Active',
      });
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Please provide valid login credentials.' };
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    localStorage.removeItem('demo_admin_auth');
    localStorage.removeItem('demo_admin_role');
    setIsAdminAuthenticated(false);
    setUser(null);
    setSession(null);
    setAdminProfile(null);

    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/login`,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Password reset request failed.' };
      }
    }
    return { success: true };
  };

  const adminRole: AdminRole = adminProfile?.role || 'Super Admin';
  const assignedProgrammeIds: string[] = adminProfile?.assigned_programme_ids || [];
  const assignedCategoryIds: string[] = adminProfile?.assigned_category_ids || [];

  const hasPermission = (featureKey: string): boolean => {
    if (adminRole === 'Super Admin') return true;
    const allowedFeatures = ROLE_PERMISSIONS[adminRole] || [];
    return allowedFeatures.includes(featureKey);
  };

  const canManageProgramme = (programmeId: string, categoryId?: string): boolean => {
    if (adminRole === 'Super Admin' || adminRole === 'Event Manager') return true;
    if (adminRole === 'Score Manager') {
      if (assignedProgrammeIds.length === 0 && assignedCategoryIds.length === 0) return true;
      const prgMatch = assignedProgrammeIds.length === 0 || assignedProgrammeIds.includes(programmeId);
      const catMatch = !categoryId || assignedCategoryIds.length === 0 || assignedCategoryIds.includes(categoryId);
      return prgMatch && catMatch;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        adminProfile,
        adminRole,
        assignedProgrammeIds,
        assignedCategoryIds,
        isAdminAuthenticated,
        isLoading,
        login,
        logout,
        resetPassword,
        hasPermission,
        canManageProgramme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
