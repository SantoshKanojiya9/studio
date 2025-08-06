
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { useToast } from './use-toast';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    picture: string;
}

interface AppUser extends User {
    user_metadata: {
        picture?: string;
        name?: string;
        full_name?: string;
        avatar_url?: string;
        deleted_at?: string | null;
    }
}


interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const client = useMemo(() => supabase, []);

  useEffect(() => {
    const handleAuthChange = async (session: Session | null) => {
        setSession(session);
        if (session?.user) {
            const appUser = session.user as AppUser;
            try {
                // Check if account was marked for deletion and recover it
                if (appUser.user_metadata?.deleted_at) {
                    const { data, error } = await client.auth.updateUser({
                        data: { ...appUser.user_metadata, deleted_at: null }
                    });

                    if (error) {
                        console.error("Error recovering account:", error);
                        toast({ title: 'Error', description: 'Could not recover your account.', variant: 'destructive'});
                        await client.auth.signOut();
                        setUserState(null);
                    } else {
                        toast({
                            title: "Welcome Back!",
                            description: "Your account has been recovered and is no longer scheduled for deletion.",
                            variant: "success",
                        });
                        if (data.user) {
                             const recoveredUser = data.user as AppUser;
                             setUserState({
                                id: recoveredUser.id,
                                name: recoveredUser.user_metadata.name || recoveredUser.email!.split('@')[0],
                                email: recoveredUser.email!,
                                picture: recoveredUser.user_metadata.picture || `https://placehold.co/64x64.png?text=${recoveredUser.email!.charAt(0).toUpperCase()}`,
                            });
                        }
                    }
                } else {
                     setUserState({
                        id: appUser.id,
                        name: appUser.user_metadata.name || appUser.email!.split('@')[0],
                        email: appUser.email!,
                        picture: appUser.user_metadata.picture || `https://placehold.co/64x64.png?text=${appUser.email!.charAt(0).toUpperCase()}`,
                    });
                }
            } catch (e: any) {
                console.error("Auth state change profile handling error:", e);
                await client.auth.signOut();
                setUserState(null);
                toast({ title: 'Error', description: 'Could not manage user profile.', variant: 'destructive'});
            }
        } else {
            setUserState(null);
        }
        setLoading(false);
    };

    const checkInitialSession = async () => {
      const { data: { session } } = await client.auth.getSession();
      await handleAuthChange(session);
    };

    checkInitialSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(
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
    <AuthContext.Provider value={{ user, session, loading, supabase: client }}>
      <React.Suspense>
        {children}
      </React.Suspense>
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
