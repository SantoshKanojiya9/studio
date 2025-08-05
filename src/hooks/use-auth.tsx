

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

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

const upsertUserProfile = async (supabase: SupabaseClient, user: User): Promise<UserProfile> => {
    console.log("Upserting profile for user:", user.id);
    const profileData = {
        id: user.id,
        name: user.user_metadata.name || `Guest-${user.id.substring(0, 6)}`,
        email: user.email!,
        picture: user.user_metadata.picture || `https://placehold.co/64x64.png?text=${user.email?.charAt(0).toUpperCase() || 'U'}`,
    };

    // Use the service role key to perform this action.
    // This is necessary because the user is not fully authenticated yet,
    // and RLS policies would block this operation on the client-side.
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabaseAdmin
        .from('users')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();
    
    if (error) {
        console.error("Error upserting user profile:", error);
        throw error;
    }
    
    console.log("Profile upserted successfully:", data);
    return data;
}

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
                // Check if user profile exists
                const { data: existingProfile, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle(); // Use maybeSingle to avoid error when no row is found
                
                if (fetchError) {
                     console.error("Error fetching user profile:", fetchError);
                }

                if (existingProfile) {
                    if (existingProfile.deleted_at) {
                        // User is soft-deleted, sign them out.
                        await supabase.auth.signOut();
                        setUserState(null);
                    } else {
                        setUserState(existingProfile);
                    }
                } else {
                    // if not, create it
                    const newProfile = await upsertUserProfile(supabase, session.user);
                    setUserState(newProfile);
                }
            } catch (e) {
                console.error("Auth state change profile handling error:", e);
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
