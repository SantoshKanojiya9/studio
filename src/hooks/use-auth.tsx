

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import { upsertUserProfile } from '@/app/actions';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    picture: string;
    deleted_at?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  loading: boolean;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        if (session && session.user) {
            try {
                // First, check if a profile already exists on the client.
                let { data: profile, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (fetchError) {
                     console.error("Error fetching user profile:", fetchError);
                }

                if (!profile) {
                    // Profile does not exist, so create it using a secure server action.
                    const profileData = {
                        id: session.user.id,
                        name: session.user.user_metadata.name || session.user.user_metadata.full_name || session.user.email!.split('@')[0],
                        email: session.user.email!,
                        picture: session.user.user_metadata.picture || session.user.user_metadata.avatar_url || `https://placehold.co/64x64.png?text=${session.user.email!.charAt(0).toUpperCase()}`,
                    };
                    
                    // Call the secure server action to create the profile.
                    profile = await upsertUserProfile(profileData);
                }

                if (profile.deleted_at) {
                    // User is soft-deleted, sign them out.
                    await supabase.auth.signOut();
                    setUserState(null);
                } else {
                    // Profile exists and is valid.
                    setUserState(profile);
                }

            } catch (e) {
                console.error("Auth state change profile handling error:", e);
                // If any error occurs, sign the user out to be safe.
                await supabase.auth.signOut();
                setUserState(null);
            }
        } else {
            setUserState(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user && pathname === '/') {
        router.push('/mood');
      } else if (!user && pathname !== '/') {
        // Only redirect to login if not already on a public page or callback
        const publicPaths = ['/', '/auth/callback'];
        if (!publicPaths.includes(pathname)) {
            router.push('/');
        }
      }
    }
  }, [user, loading, pathname, router]);

  const setUser = (userProfile: UserProfile | null) => {
    if (userProfile === null) {
      supabase.auth.signOut().then(() => router.refresh());
    }
    setUserState(userProfile);
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, supabase }}>
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
