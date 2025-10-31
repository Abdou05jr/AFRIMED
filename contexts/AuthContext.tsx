import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, fullName: string, country: string) => Promise<{ error: Error | null; success?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const isAdmin = profile?.is_admin || false;

  useEffect(() => {
    initializeAuth();
  }, []);

 const initializeAuth = async () => {
   try {
     const { data: { session }, error } = await supabase.auth.getSession();

     if (error) {
       console.error('Error getting session:', error);
       setAuthError('Failed to initialize authentication');
       return;
     }

     if (session) {
       setSession(session);
       setUser(session.user);
       await fetchProfile(session.user.id);
     } else {
       setUser(null);
       setProfile(null);
     }
   } catch (error) {
     console.error('Auth initialization error:', error);
     setAuthError('Authentication system error');
   } finally {
     // Only mark initialized *after* session check completes
     setInitialized(true);
     setLoading(false);
   }
 };


  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'User:', session?.user?.id);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('Fetching profile for user:', session.user.id);
        await fetchProfile(session.user.id);
      } else {
        console.log('No user, clearing profile');
        setProfile(null);
        setLoading(false);

        // Clear error on sign out
        if (event === 'SIGNED_OUT') {
          setAuthError(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Fetching profile for:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setAuthError('Failed to load user profile');
        return;
      }

      console.log('Profile fetched:', data);
      setProfile(data);

      // If profile doesn't exist, create one
      if (!data && user) {
        console.log('Creating default profile for user:', userId);
        await createDefaultProfile(userId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setAuthError('Profile loading error');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user?.email,
          full_name: user?.user_metadata?.full_name || 'User',
          country: user?.user_metadata?.country || 'Unknown',
          avatar_url: null,
          is_admin: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      console.log('Default profile created for:', userId);
      // Refresh profile after creation
      await fetchProfile(userId);
    } catch (error) {
      console.error('Error creating default profile:', error);
      setAuthError('Failed to create user profile');
    }
  };

  const signUp = async (email: string, password: string, fullName: string, country: string) => {
    try {
      setAuthError(null);
      setLoading(true);

      // Validate input
      if (!email || !password || !fullName) {
        throw new Error('Please fill in all required fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            country: country,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            country,
            avatar_url: null,
            is_admin: false,
            is_active: true,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here - user is created but profile failed
        }

        // Show success message for email confirmation
        if (data.session) {
          return { error: null, success: true };
        } else {
          return {
            error: null,
            success: true,
          };
        }
      }

      throw new Error('Registration failed - no user data returned');
    } catch (error: any) {
      console.error('Sign up error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email to confirm your account.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAuthError(errorMessage);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthError(null);
      setLoading(true);

      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      console.log('Attempting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Sign in successful:', data);


      // ✅ Force refresh session and profile immediately
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && sessionData?.session) {
        setSession(sessionData.session);
        setUser(sessionData.session.user);
        await fetchProfile(sessionData.session.user.id);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before signing in.';
      } else if (error.message.includes('Email rate limit exceeded')) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAuthError(errorMessage);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setProfile(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setAuthError('Failed to sign out');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh local profile data
      await refreshProfile();

      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      setAuthError('Failed to update profile');
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthError(null);

      if (!email) {
        throw new Error('Please enter your email address');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'afrimed://reset-password',
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);

      let errorMessage = 'Failed to send reset email. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      setAuthError(errorMessage);
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setAuthError(null);

      if (!newPassword) {
        throw new Error('Please enter a new password');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      setAuthError('Failed to update password');
      return { error: error as Error };
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    updateProfile,
    resetPassword,
    updatePassword,
    isAuthenticated,
    isAdmin,
    authError,
    clearAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();

  return {
    isAuthenticated,
    loading,
    requireAuth: !loading && !isAuthenticated,
  };
}

// Hook for admin-only features
export function useRequireAdmin() {
  const { isAdmin, isAuthenticated, loading } = useAuth();

  return {
    isAdmin,
    isAuthenticated,
    loading,
    requireAdmin: !loading && (!isAuthenticated || !isAdmin),
  };
}
