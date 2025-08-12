
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSupport } from '@/hooks/use-support';
import { StoryRing } from './story-ring';
import type { EmojiState } from '@/app/design/page';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const PostView = dynamic(() => import('@/components/post-view').then(mod => mod.PostView), { ssr: false });

interface Mood extends EmojiState {
  mood_id: number;
  mood_created_at: string;
  mood_user_id: string;
  is_viewed?: boolean;
  mood_user?: {
      id: string;
      name: string;
      picture: string;
  }
}

interface User {
  id: string;
  name: string;
  picture: string;
  is_private: boolean;
  support_status: 'approved' | 'pending' | null;
  has_mood: boolean;
}

interface UserListItemProps {
  itemUser: User;
  onSupportChange: (userId: string, newStatus: 'approved' | 'pending' | null) => void;
}

export const UserListItem = React.memo(({ itemUser, onSupportChange }: UserListItemProps) => {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const [viewingStory, setViewingStory] = useState<Mood[] | null>(null);

    const { supportStatus, isLoading, handleSupportToggle } = useSupport(
        itemUser.id, 
        itemUser.support_status,
        itemUser.is_private,
        onSupportChange
    );
    
    const isSelf = currentUser?.id === itemUser.id;

    const handleAvatarClick = async (e: React.MouseEvent) => {
        if (!itemUser.has_mood || !currentUser) return;
        e.preventDefault();
        e.stopPropagation();

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
            .from('moods')
            .select('id, created_at, emoji:emojis!inner(*, user:users!inner(id, name, picture)), views:mood_views(viewer_id)')
            .eq('user_id', itemUser.id)
            .gte('created_at', twentyFourHoursAgo)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error || !data) {
            toast({ title: 'Could not load story', variant: 'destructive' });
            return;
        }

        const views = (data.views as unknown as { viewer_id: string }[]) || [];
        const isViewed = views.some(view => view.viewer_id === currentUser.id);
        const mood: Mood = {
            ...(data.emoji as unknown as EmojiState),
            mood_id: data.id,
            mood_created_at: data.created_at,
            mood_user_id: itemUser.id,
            mood_user: data.emoji.user,
            is_viewed: isViewed,
        };
        setViewingStory([mood]);
    };

    if (viewingStory) {
        return (
            <PostView
              emojis={viewingStory}
              initialIndex={0}
              onClose={() => setViewingStory(null)}
              isMoodView={true}
            />
        )
    }

    return (
        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
            <button onClick={handleAvatarClick} disabled={!itemUser.has_mood}>
                <StoryRing hasStory={itemUser.has_mood}>
                <Avatar className="h-12 w-12">
                    <AvatarImage src={itemUser.picture} alt={itemUser.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{itemUser.name ? itemUser.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                </StoryRing>
            </button>
            <Link href={`/gallery?userId=${itemUser.id}`} className="font-semibold flex-1">{itemUser.name}</Link>
            {!isSelf && currentUser && (
                 <Button 
                    variant={supportStatus === 'approved' || supportStatus === 'pending' ? 'secondary' : 'default'}
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSupportToggle();
                    }}
                    disabled={isLoading}
                 >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                        (supportStatus === 'approved' ? 'Unsupport' : 
                         supportStatus === 'pending' ? 'Pending' : 'Support')}
                </Button>
            )}
        </div>
    )
});
UserListItem.displayName = 'UserListItem';
