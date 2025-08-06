
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
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
    const handleAuthChange = async (session: Session | null) => {
        if (session?.user) {
            try {
                let { data: profile, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (fetchError && fetchError.code === 'PGRST116') { // Profile doesn't exist, create it
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

                    if (insertError) throw insertError;
                    profile = newProfile;
                } else if (fetchError) {
                    throw fetchError;
                }

                if (profile?.deleted_at) { // Account was soft-deleted, now recover it
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ deleted_at: null })
                        .eq('id', profile.id);
                    
                    if (updateError) throw updateError;
                    
                    setUserState({ ...profile, deleted_at: null });
                    toast({
                        title: "Welcome Back!",
                        description: "Your account deletion has been cancelled.",
                        variant: "success",
                    });
                } else if (profile) {
                    setUserState(profile);
                }
            } catch (e: any) {
                console.error("Auth state change profile handling error:", e);
                await supabase.auth.signOut();
                setUserState(null);
                toast({ title: 'Error', description: 'Could not manage user profile.', variant: 'destructive'});
            }
        } else {
            setUserState(null);
        }
        setLoading(false);
    };

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthChange(session);
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await handleAuthChange(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/';
      const isAuthCallback = pathname === '/auth/callback';

      if (user && isAuthPage) {
        router.push('/mood');
      } else if (!user && !isAuthPage && !isAuthCallback) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);
  
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, supabase }}>
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
