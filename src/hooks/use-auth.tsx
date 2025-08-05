
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useToast } from './use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    // Check for an active session on initial load
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
      }
    };
    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session && session.user) {
            try {
                // First, check if a profile already exists on the client.
                let { data: profile, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (fetchError && fetchError.code === 'PGRST116') {
                    // Profile does not exist, so create it using the client.
                    // This will succeed because of the RLS policies.
                    const { data: newProfile, error: insertError } = await supabase
                        .from('users')
                        .insert({
                            id: session.user.id,
                            name: session.user.user_metadata.name || session.user.user_metadata.full_name || session.user.email!.split('@')[0],
                            email: session.user.email!,
                            picture: session.user.user_metadata.picture || session.user.user_metadata.avatar_url || `https://placehold.co/64x64.png?text=${session.user.email!.charAt(0).toUpperCase()}`,
                        })
                        .select()
                        .single();

                    if (insertError) {
                        console.error("Error creating user profile:", insertError);
                        throw new Error("Could not create user profile.");
                    }
                    profile = newProfile;
                } else if (fetchError) {
                    console.error("Error fetching user profile:", fetchError);
                }


                if (profile?.deleted_at) {
                    // User is soft-deleted, but is logging back in.
                    // This cancels the deletion.
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ deleted_at: null })
                        .eq('id', profile.id);
                    
                    if (updateError) {
                        console.error('Error cancelling account deletion:', updateError);
                        // Sign out if we can't update
                        await supabase.auth.signOut();
                        setUserState(null);
                    } else {
                        // Successfully cancelled deletion
                        setUserState({ ...profile, deleted_at: null });
                        toast({
                            title: "Welcome Back!",
                            description: "Your account deletion has been cancelled.",
                            variant: "success",
                        });
                    }
                } else if (profile) {
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
      supabase.auth.signOut();
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
