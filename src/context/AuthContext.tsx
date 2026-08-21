'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { AdminRole, AdminProfile, getAdminProfiles, logActivity } from '@/lib/cmsService';

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
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchAdminProfile(session.user.email || '', session.user.id);
        } else {
          setIsAdminAuthenticated(false);
          setAdminProfile(null);
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchAdminProfile(session.user.email || '', session.user.id);
        } else {
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

  const fetchAdminProfile = async (email: string, userId?: string): Promise<boolean> => {
    try {
      const profiles = await getAdminProfiles();
      let match = profiles.find(p => (userId && p.id === userId) || p.email.toLowerCase() === email.toLowerCase());

      // FIRST SUPER ADMIN BOOTSTRAP MECHANISM
      // If Supabase is connected and 0 admin profiles exist in the database,
      // securely bootstrap the first authenticated user as Super Admin.
      if (!match && profiles.length === 0 && isSupabaseConfigured() && userId && email) {
        const firstAdmin: AdminProfile = {
          id: userId,
          email: email,
          name_en: email.split('@')[0] || 'Super Administrator',
          role: 'Super Admin',
          status: 'Active',
          assigned_programme_ids: [],
          assigned_category_ids: [],
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        };

        try {
          const { data, error } = await supabase.from('admin_profiles').insert([firstAdmin]).select().single();
          if (!error && data) {
            match = data;
          } else {
            match = firstAdmin;
          }
          await logActivity('bootstrap_super_admin', 'admin_profiles', userId, `First Super Admin account bootstrapped for "${email}"`);
        } catch (bootErr) {
          console.warn('Bootstrap insert warning:', bootErr);
          match = firstAdmin;
        }
      }

      if (match) {
        if (match.status === 'Disabled') {
          await supabase.auth.signOut();
          setIsAdminAuthenticated(false);
          setAdminProfile(null);
          return false;
        }
        setAdminProfile(match);
        setIsAdminAuthenticated(true);
        return true;
      } else {
        // User authenticated in Supabase but not assigned an Admin role in DB -> DENY ACCESS!
        await supabase.auth.signOut();
        setIsAdminAuthenticated(false);
        setAdminProfile(null);
        return false;
      }
    } catch (e) {
      console.warn('Error fetching admin profile:', e);
      setIsAdminAuthenticated(false);
      setAdminProfile(null);
      return false;
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
        
        const isAuthorized = await fetchAdminProfile(data.user.email || '', data.user.id);
        if (!isAuthorized) {
          setIsLoading(false);
          return {
            success: false,
            error: 'Access Denied: You do not have administrator access. Please contact the event administrator.',
          };
        }

        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Authentication failed.' };
      }
    }

    setIsLoading(false);
    return { success: false, error: 'Supabase authentication is not configured.' };
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
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
