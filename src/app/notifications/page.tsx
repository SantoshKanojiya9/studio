
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, UserPlus, Heart, Check, X } from 'lucide-react';
import { getNotifications, respondToSupportRequest, getSupportStatus, supportUser, unsupportUser } from '../actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import type { EmojiState } from '@/app/design/page';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const NotificationHeader = () => (
    <header className="flex h-16 items-center border-b border-border/40 bg-background px-4 md:px-6">
        <h1 className="text-xl font-bold">Notifications</h1>
    </header>
);

interface Actor {
    id: string;
    name: string;
    picture: string;
    is_private: boolean;
}

interface Notification {
  id: number;
  type: 'new_supporter' | 'new_like' | 'new_support_request' | 'support_request_approved';
  created_at: string;
  emoji_id: string | null;
  actor: Actor;
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

const SupportNotification = ({ notification }: { notification: Notification }) => {
    const { actor, created_at, id } = notification;
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const [supportStatus, setSupportStatus] = useState<'approved' | 'pending' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }
        getSupportStatus(currentUser.id, actor.id).then(status => {
            setSupportStatus(status);
            setIsLoading(false);
        });
    }, [currentUser, actor.id]);

    const handleSupportToggle = async () => {
        if (!currentUser || isLoading) return;

        setIsLoading(true);
        try {
            if (supportStatus === 'approved' || supportStatus === 'pending') {
                await unsupportUser(actor.id);
                setSupportStatus(null);
            } else {
                await supportUser(actor.id, actor.is_private);
                setSupportStatus(actor.is_private ? 'pending' : 'approved');
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50">
             <Link href={`/gallery?userId=${actor.id}`} className="relative flex-shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={actor.picture} alt={actor.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{actor.name ? actor.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                    <UserPlus className="h-3 w-3 text-primary-foreground"/>
                </div>
            </Link>
            <p className="flex-1 text-sm">
                <Link href={`/gallery?userId=${actor.id}`} className="font-semibold">{actor.name}</Link>
                {' became your supporter. '}
                <span className="text-muted-foreground">{timeSince(new Date(created_at))}</span>
            </p>
            <Button
                variant={supportStatus === 'approved' || supportStatus === 'pending' ? 'secondary' : 'default'}
                size="sm"
                onClick={handleSupportToggle}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> :
                 supportStatus === 'approved' ? 'Unsupport' :
                 supportStatus === 'pending' ? 'Pending' : 'Support'}
            </Button>
        </div>
    );
};


const SupportRequestNotification = ({ notification, onRespond }: { notification: Notification; onRespond: (id: number) => void; }) => {
    const { actor, created_at, id } = notification;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<'approve' | 'decline' | null>(null);

    const handleResponse = async (action: 'approve' | 'decline') => {
        setIsLoading(action);
        try {
            await respondToSupportRequest(actor.id, action);
            toast({
                title: `Request ${action === 'approve' ? 'Approved' : 'Declined'}`,
                variant: 'success',
            });
            onRespond(id);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(null);
        }
    }

    return (
        <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50">
            <Link href={`/gallery?userId=${actor.id}`} className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={actor.picture} alt={actor.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{actor.name ? actor.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
            </Link>
            <p className="flex-1 text-sm">
                <Link href={`/gallery?userId=${actor.id}`} className="font-semibold">{actor.name}</Link>
                {' wants to support you. '}
                <span className="text-muted-foreground">{timeSince(new Date(created_at))}</span>
            </p>
            <div className="flex gap-2">
                <Button size="sm" onClick={() => handleResponse('approve')} disabled={!!isLoading}>
                    {isLoading === 'approve' ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Approve'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleResponse('decline')} disabled={!!isLoading}>
                    {isLoading === 'decline' ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Decline'}
                </Button>
            </div>
        </div>
    );
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
  
  const handleRequestResponded = (notificationId: number) => {
    setNotifications(current => current.filter(n => n.id !== notificationId));
  }

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

    if (type === 'new_support_request') {
      return <SupportRequestNotification key={notification.id} notification={notification} onRespond={handleRequestResponded} />;
    }
    
    if (type === 'support_request_approved') {
         return (
             <Link href={`/gallery?userId=${actor.id}`} key={notification.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer">
                <div className="relative">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={actor.picture} alt={actor.name} data-ai-hint="profile picture" />
                        <AvatarFallback>{actor.name ? actor.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                     <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white"/>
                    </div>
                </div>
                <p className="flex-1 text-sm">
                    <span className="font-semibold">{actor.name}</span>
                    {' approved your support request.'}
                    <span className="text-muted-foreground ml-2">{timeSince(new Date(created_at))}</span>
                </p>
            </Link>
        )
    }

    if (type === 'new_supporter') {
         return <SupportNotification key={notification.id} notification={notification} />
    }

    if (type === 'new_like' && emoji) {
        return (
             <Link href={`/gallery`} key={notification.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={actor.picture} alt={actor.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{actor.name ? actor.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <p className="flex-1 text-sm">
                    <span className="font-semibold">{actor.name}</span>
                    {' reacted to your post.'}
                    <span className="text-muted-foreground ml-2">{timeSince(new Date(created_at))}</span>
                </p>
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
            notifications.map(renderNotification)
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

    