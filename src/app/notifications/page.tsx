
'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getNotifications } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import type { EmojiState } from '@/app/design/page';

const NotificationHeader = () => (
    <header className="flex h-16 items-center border-b border-border/40 bg-background px-4 md:px-6">
        <h1 className="text-xl font-bold">Notifications</h1>
    </header>
);

interface Notification {
    id: number;
    type: 'follow' | 'reaction';
    created_at: string;
    sender: {
        id: string;
        name: string;
        picture: string;
    };
    emoji: EmojiState | null;
}

// Function to format time difference
const timeAgo = (date: string) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    
    return Math.floor(seconds) + "s";
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getNotifications()
        .then(data => {
            setNotifications(data as Notification[]);
            setIsLoading(false);
        })
        .catch(error => {
            console.error(error);
            setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  if (isLoading) {
    return (
        <div className="flex h-full w-full flex-col">
            <NotificationHeader />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <NotificationHeader />
      <div className="flex-1 overflow-y-auto">
        {notifications.length > 0 ? (
            <ul>
            {notifications.map((notification) => (
                <li key={notification.id} className="flex items-center gap-3 p-4 border-b border-border/40 hover:bg-muted/50 cursor-pointer">
                <Avatar className="h-11 w-11">
                    <AvatarImage src={notification.sender.picture} data-ai-hint="profile picture" />
                    <AvatarFallback>{notification.sender.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">
                    <span className="font-semibold">{notification.sender.name}</span>
                    {notification.type === 'follow' ? (
                    <span> 🔥 just subscribed to you!</span>
                    ) : (
                    <span> 💬 reacted to your emoji.</span>
                    )}
                    <span className="text-muted-foreground ml-2">{timeAgo(notification.created_at)}</span>
                </div>
                {notification.type === 'reaction' && notification.emoji && (
                    <div className="h-12 w-12 rounded-md overflow-hidden">
                        <GalleryThumbnail emoji={notification.emoji} onSelect={() => {}} />
                    </div>
                )}
                </li>
            ))}
            </ul>
        ) : (
             <div className="text-center p-8 text-muted-foreground">
                <p>No notifications yet.</p>
             </div>
        )}
      </div>
    </div>
  );
}
