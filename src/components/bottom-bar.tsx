
'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';


export function BottomBar() {
  const segment = useSelectedLayoutSegment();
  const { user, supabase } = useAuth();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check for existing notifications initially
    const checkInitialNotifications = async () => {
        const lastChecked = localStorage.getItem('last_notification_check');
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .gt('created_at', lastChecked || new Date(0).toISOString());
        
        if (!error && (count ?? 0) > 0) {
            setHasNewNotifications(true);
        }
    }
    checkInitialNotifications();


    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes', 
        { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications', 
            filter: `recipient_id=eq.${user.id}` 
        }, 
        (payload) => {
            console.log('New notification received!', payload);
            setHasNewNotifications(true);
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    }
  }, [user, supabase]);

  useEffect(() => {
    // When the user visits the notifications page, clear the indicator
    if (segment === 'notifications') {
        setHasNewNotifications(false);
        localStorage.setItem('last_notification_check', new Date().toISOString());
    }
  }, [segment]);
  
  const navItems = [
    { href: '/mood', segment: 'mood', label: 'Home', icon: Home },
    { href: '/explore', segment: 'explore', label: 'Search', icon: Search },
    { href: '/design', segment: 'design', label: 'Create', icon: PlusSquare },
    { href: '/notifications', segment: 'notifications', label: 'Notifications', icon: Bell, hasIndicator: hasNewNotifications },
    { href: '/gallery', segment: 'gallery', label: 'Profile', icon: User, isProfile: true },
  ];

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-border/40 bg-background backdrop-blur md:hidden">
      <nav className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.segment === segment;
            
            if (item.isProfile) {
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center justify-center rounded-md transition-colors w-12 h-12',
                            isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        )}
                    >
                        <Avatar className={cn(
                            "h-7 w-7"
                        )}>
                            {user?.picture && <Image src={user.picture} alt={user.name || 'profile'} data-ai-hint="profile picture" width={28} height={28} className="rounded-full" />}
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
                  'relative flex items-center justify-center rounded-md transition-colors w-12 h-12',
                  'text-muted-foreground'
                )}
              >
                <Icon className={cn("h-7 w-7", isActive && "text-primary")} />
                {item.hasIndicator && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </Link>
            )
        })}
      </nav>
    </footer>
  );
}
