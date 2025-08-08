
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, UserPlus, Heart } from 'lucide-react';
import { getNotifications } from '../actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import type { EmojiState } from '@/app/design/page';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NotificationHeader = () => (
    <header className="flex h-16 items-center border-b border-border/40 bg-background px-4 md:px-6">
        <h1 className="text-xl font-bold">Notifications</h1>
    </header>
);

interface Notification {
  id: number;
  type: 'new_supporter' | 'new_like';
  created_at: string;
  emoji_id: string | null;
  actor: {
    id: string;
    name: string;
    picture: string;
  };
  emoji: EmojiState | null;
}

const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return Math.floor(seconds) + "s";
};

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const data = await getNotifications();
          setNotifications(data as Notification[]);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchNotifications();
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

  const renderNotification = (notification: Notification) => {
    const { actor, type, emoji, created_at } = notification;
    const commonClasses = "flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer";
    const timeAgo = timeSince(new Date(created_at));

    const Message = () => (
        <p className="flex-1 text-sm">
            <span className="font-semibold">{actor.name}</span>
            {type === 'new_supporter' ? ' started supporting you.' : ' reacted to your creation.'}
            <span className="text-muted-foreground ml-2">{timeAgo}</span>
        </p>
    );

    if (type === 'new_supporter') {
        return (
            <Link href={`/gallery?userId=${actor.id}`} key={notification.id} className={commonClasses}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={actor.picture} alt={actor.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{actor.name ? actor.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <Message />
                <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full h-8 w-8">
                    <UserPlus className="h-4 w-4" />
                </div>
            </Link>
        );
    }

    if (type === 'new_like' && emoji) {
        return (
             <Link href={`/gallery`} key={notification.id} className={commonClasses}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={actor.picture} alt={actor.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{actor.name ? actor.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <Message />
                <div className="w-12 h-12 flex-shrink-0">
                   <GalleryThumbnail emoji={emoji} onSelect={() => router.push('/gallery')} />
                </div>
            </Link>
        )
    }
    
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <NotificationHeader />
      <div className="flex-1 overflow-y-auto">
        {notifications.length > 0 ? (
          <>
            <div className="p-4 text-sm text-center text-muted-foreground bg-muted/30 border-b">
                Notifications clear automatically after 24 hours.
            </div>
            {notifications.map(renderNotification)}
          </>
        ) : (
          <div className="text-center p-8 text-muted-foreground h-full flex flex-col items-center justify-center">
              <Heart className="w-16 h-16 mb-4"/>
              <h2 className="text-xl font-semibold text-foreground">Activity On Your Posts</h2>
              <p>When someone likes or supports you, you'll see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
