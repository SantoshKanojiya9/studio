
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { useToast } from './use-toast';
import { getUserProfile, recoverUserAccount } from '@/app/actions';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    picture: string;
    deleted_at?: string | null;
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

  const handleAuthChange = useCallback(async (session: Session | null) => {
    setSession(session);
    if (session?.user) {
        const userProfile = await getUserProfile(session.user.id);

        if (userProfile?.deleted_at) {
            try {
                await recoverUserAccount();
                toast({ 
                    title: "Welcome Back!", 
                    description: "Your account has been recovered.", 
                    variant: "success" 
                });
                // Refetch profile to get the updated (non-deleted) state
                const recoveredProfile = await getUserProfile(session.user.id);
                setUserState(recoveredProfile);
            } catch (error) {
                console.error("Failed to recover user:", error);
                toast({ title: 'Error', description: 'Could not recover your account.', variant: 'destructive'});
                setUserState(null);
                await client.auth.signOut(); // Sign out if recovery fails
            }
        } else {
            setUserState(userProfile);
        }
    } else {
        setUserState(null);
    }
    setLoading(false);
  }, [client, toast]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
        const { data: { session: initialSession } } = await client.auth.getSession();
        
        if (isMounted) {
            await handleAuthChange(initialSession);
        }

        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (isMounted) {
                // When auth state changes, re-fetch everything
                setLoading(true);
                await handleAuthChange(newSession);
                setLoading(false);
            }
          }
        );

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    };
    
    initializeAuth();
  }, [client, handleAuthChange]);

  useEffect(() => {
    if (loading) return; // Don't run redirects until initial auth state is determined

    const isAuthPage = pathname === '/';
    const isAuthCallback = pathname.startsWith('/auth/callback');

    if (user && isAuthPage) {
        router.push('/mood');
    } else if (!user && !isAuthPage && !isAuthCallback) {
        router.push('/');
    }
  }, [user, loading, pathname, router]);
  
  // Show a global loader while we are determining the auth state
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
