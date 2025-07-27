
'use client';

import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

export function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }
  
  if (user) {
    return (
        <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
    );
  }

  // Return null when logged out, as the sign-in is in the menu now
  return null;
}
