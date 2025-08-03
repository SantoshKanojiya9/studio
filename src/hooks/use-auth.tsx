
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    picture: string;
}

interface AuthContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { session } } = supabase.auth.getSessionFromUrl({
      storeSession: true,
    });
    
    if (session) {
      const userProfile = {
        id: session.user.id,
        name: session.user.user_metadata.name,
        email: session.user.email!,
        picture: session.user.user_metadata.picture,
      };
      setUserState(userProfile);
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
            const userProfile = {
                id: session.user.id,
                name: session.user.user_metadata.name,
                email: session.user.email!,
                picture: session.user.user_metadata.picture,
            };
            setUserState(userProfile);
        } else {
            setUserState(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/') {
        router.push('/');
    }
  }, [user, loading, pathname, router]);

  const setUser = (userProfile: UserProfile | null) => {
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
    <AuthContext.Provider value={{ user, setUser, loading }}>
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
