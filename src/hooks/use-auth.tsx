
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { useToast } from './use-toast';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    picture: string;
    is_private: boolean;
    deleted_at?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const client = useMemo(() => supabase, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const handleAuthChange = async (currentSession: Session | null) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
            // Fetch the latest profile data from the 'users' table
            const { data: profile, error } = await client
                .from('users')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
                // Fallback to metadata if profile doesn't exist yet
                 const authUser = currentSession.user;
                 const newUser = {
                    id: authUser.id,
                    email: authUser.email || '',
                    name: authUser.user_metadata.name || authUser.email?.split('@')[0] || 'User',
                    picture: authUser.user_metadata.picture || `https://placehold.co/64x64.png?text=${(authUser.email || 'U').charAt(0).toUpperCase()}`,
                    is_private: false,
                };
                 setUser(newUser);
                 localStorage.setItem('userProfile', JSON.stringify(newUser));

            } else if (profile) {
                const userProfile = {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    picture: profile.picture,
                    is_private: profile.is_private,
                    deleted_at: profile.deleted_at,
                };
                setUser(userProfile);
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
            }
        } else {
            setUser(null);
            localStorage.removeItem('userProfile');
        }
        
        if (isMounted) {
            setLoading(false);
        }
    };
    
    // Restore session from localStorage on initial load
    const storedUser = localStorage.getItem('userProfile');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse stored user profile", e);
            localStorage.removeItem('userProfile');
        }
    }
    
    // Check initial session state from Supabase
    client.auth.getSession().then(({ data: { session } }) => {
        handleAuthChange(session);
    }).finally(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event, newSession) => {
        if (_event === "TOKEN_REFRESHED" || _event === "SIGNED_IN") {
            handleAuthChange(newSession);
        } else if (_event === "SIGNED_OUT") {
            setUser(null);
            setSession(null);
            localStorage.removeItem('userProfile');
        }
      }
    );

    return () => {
        isMounted = false;
        subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return; 
  
    const publicPaths = ['/', '/terms', '/about'];
    const isAuthPage = publicPaths.includes(pathname);
    const isAuthCallback = pathname.startsWith('/auth/callback');

    if (user && pathname === '/') {
        router.push('/mood');
    } else if (!user && !isAuthPage && !isAuthCallback) {
        router.push('/');
    }
  }, [user, loading, pathname, router]);
  
  if (loading && pathname !== '/') {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, setLoading, supabase: client }}>
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
