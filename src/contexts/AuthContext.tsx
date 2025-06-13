
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  genre_preferences: number[];
  onboarding_completed: boolean;
  watchlist: number[];
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (avatar: string, genres: number[]) => Promise<void>;
  addToWatchlist: (movieId: number) => Promise<void>;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  isInWatchlist: (movieId: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          await loadUserProfile(session.user);
          setLoading(false);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          username: profile.username,
          email: authUser.email || '',
          avatar: profile.avatar || '👤',
          genre_preferences: profile.genre_preferences || [],
          onboarding_completed: profile.onboarding_completed || false,
          watchlist: profile.watchlist || []
        });
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Clean up any existing state
      await supabase.auth.signOut({ scope: 'global' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        window.location.href = '/';
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;
      
      if (data.user) {
        window.location.href = '/onboarding';
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const completeOnboarding = async (avatar: string, genres: number[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar,
          genre_preferences: genres,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({
        ...user,
        avatar,
        genre_preferences: genres,
        onboarding_completed: true
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const addToWatchlist = async (movieId: number) => {
    if (!user) return;

    try {
      const updatedWatchlist = [...user.watchlist, movieId];
      
      const { error } = await supabase
        .from('profiles')
        .update({ watchlist: updatedWatchlist })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, watchlist: updatedWatchlist });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) return;

    try {
      const updatedWatchlist = user.watchlist.filter(id => id !== movieId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ watchlist: updatedWatchlist })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, watchlist: updatedWatchlist });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  };

  const isInWatchlist = (movieId: number): boolean => {
    return user?.watchlist.includes(movieId) || false;
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    completeOnboarding,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
