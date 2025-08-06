
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
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

    const handleAuthChange = async (currentSession: Session | null) => {
        if (!isMounted) return;
        setLoading(true);

        setSession(currentSession);
        if (currentSession?.user) {
            try {
                const userProfile = await getUserProfile(currentSession.user.id);

                if (userProfile?.deleted_at) {
                    await recoverUserAccount();
                    toast({
                        title: "Welcome Back!",
                        description: "Your account has been recovered.",
                        variant: "success",
                    });
                    const recoveredProfile = await getUserProfile(currentSession.user.id);
                    setUser(recoveredProfile);
                } else {
                    setUser(userProfile);
                }
            } catch (error) {
                console.error("Error fetching or recovering user profile:", error);
                setUser(null);
                await client.auth.signOut();
            }
        } else {
            setUser(null);
        }
        
        if (isMounted) {
            setLoading(false);
        }
    };
    
    // Check initial session
    client.auth.getSession().then(({ data: { session } }) => {
        handleAuthChange(session);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_event, newSession) => {
        handleAuthChange(newSession);
      }
    );

    return () => {
        isMounted = false;
        subscription?.unsubscribe();
    };
  }, [client, toast]);

  useEffect(() => {
    if (loading) return; 

    const isAuthPage = pathname === '/';
    const isAuthCallback = pathname.startsWith('/auth/callback');

    if (user && isAuthPage) {
        router.push('/mood');
    } else if (!user && !isAuthPage && !isAuthCallback) {
        router.push('/');
    }
  }, [user, loading, pathname, router]);
  
  if (loading && !user) { // Only show full-page loader on initial load without a user
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
