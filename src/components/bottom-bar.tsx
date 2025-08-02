
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useAuth } from '@/context/AuthContext';


export function BottomBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/mood', label: 'Home', icon: Home },
    { href: '/explore', label: 'Search', icon: Search },
    { href: '/design', label: 'Create', icon: PlusSquare },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/gallery', label: 'Profile', icon: User, isProfile: true },
  ];

  return (
    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            if (item.isProfile) {
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center justify-center rounded-md transition-colors w-12 h-12',
                            !isActive && 'hover:bg-accent/50'
                        )}
                    >
                        <Avatar className={cn(
                            "h-7 w-7",
                             isActive && "outline outline-2 outline-offset-2 outline-primary"
                        )}>
                            <AvatarImage src={user?.picture} alt={user?.name || 'profile'} data-ai-hint="profile picture" />
                            <AvatarFallback>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                    </Link>
                )
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-center rounded-md transition-colors w-12 h-12',
                  !isActive && 'hover:bg-accent/50 text-muted-foreground'
                )}
              >
                <Icon className={cn("h-7 w-7", isActive && "text-primary")} />
              </Link>
            )
        })}
      </nav>
    </footer>
  );
}
