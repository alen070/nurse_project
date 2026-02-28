/**
 * ============================================
 * AUTHENTICATION CONTEXT — Supabase Auth
 * ============================================
 * Manages user authentication state across the app.
 * Uses Supabase Auth for email/password, Google OAuth, and phone OTP.
 * User profile data is stored in the `profiles` table (auto-created via DB trigger).
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { UserDB, ShelterDB, initializeDatabase } from '@/store/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPhone: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; name: string; phone: string; role: UserRole; location?: string; shelterName?: string; shelterAddress?: string; shelterLat?: number; shelterLng?: number; shelterCapacity?: number }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and restore session on mount
  useEffect(() => {
    initializeDatabase();

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await UserDB.getById(session.user.id);
        if (profile) {
          setUser(profile);
        }
      }
      setLoading(false);
    }).catch(() => {
      // Supabase unreachable — still stop loading
      setLoading(false);
    });

    // Safety timeout: never stay on loading screen forever
    const timeout = setTimeout(() => setLoading(false), 5000);

    // Listen for auth state changes (skip INITIAL_SESSION to avoid race with getSession above)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return; // Already handled by getSession above

        if (event === 'SIGNED_OUT') {
          setUser(null);
          return;
        }

        if (session?.user) {
          // Small delay to allow the DB trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 500));
          const profile = await UserDB.getById(session.user.id);
          if (profile) {
            setUser(profile);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    // onAuthStateChange will update the user state
    return { success: true };
  }, []);

  const loginWithPhone = useCallback(async (phone: string, otp: string) => {
    if (!phone || phone.length < 10) {
      return { success: false, error: 'Please enter a valid phone number.' };
    }

    if (!otp) {
      // Step 1: Send OTP
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) return { success: false, error: error.message };
      return { success: true, error: 'OTP sent! Please enter the code.' };
    }

    // Step 2: Verify OTP
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });
    if (error) return { success: false, error: error.message };

    return { success: true };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const register = useCallback(async (data: {
    email: string; password: string; name: string;
    phone: string; role: UserRole; location?: string;
    shelterName?: string; shelterAddress?: string;
    shelterLat?: number; shelterLng?: number; shelterCapacity?: number;
  }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.role === 'shelter' ? (data.shelterName || data.name) : data.name,
          phone: data.phone,
          role: data.role,
          location: data.role === 'shelter' ? (data.shelterAddress || data.location || '') : (data.location || ''),
          lat: data.role === 'shelter' ? (data.shelterLat || 0) : 0,
          lng: data.role === 'shelter' ? (data.shelterLng || 0) : 0,
          capacity: data.role === 'shelter' ? (data.shelterCapacity || 50) : 0
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      return { success: false, error: error.message };
    }

    // If registering as shelter, create a shelter record linked to the new user
    if (data.role === 'shelter') {
      try {
        // Get the newly created user's ID from the sign-up response
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (userId) {
          await ShelterDB.create({
            name: data.shelterName || data.name,
            address: data.shelterAddress || data.location || '',
            latitude: data.shelterLat || 0,
            longitude: data.shelterLng || 0,
            phone: data.phone,
            email: data.email,
            capacity: data.shelterCapacity || 50,
            shelterUserId: userId,
          });
        }
      } catch (err) {
        console.error('Failed to create shelter record during registration:', err);
        // We still return success: true because the auth user was successfully created
      }
    }

    return { success: true };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updated = await UserDB.update(user.id, updates);
    if (updated) setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      loginWithPhone,
      loginWithGoogle,
      register,
      resetPassword,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

/** Type guard for role-based access */
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}
