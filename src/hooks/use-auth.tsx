
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('userProfile');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
        localStorage.setItem('userProfile', JSON.stringify(user));
    } else {
        localStorage.removeItem('userProfile');
    }

    if (!loading && !user && pathname !== '/') {
        router.push('/');
    }
  }, [user, loading, pathname, router]);

  const handleSetUser = (userProfile: UserProfile | null) => {
    setUser(userProfile);
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, loading }}>
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
