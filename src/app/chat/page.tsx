
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { EmojiState } from '@/app/design/page';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { StoryRing } from '@/components/story-ring';
import Link from 'next/link';

interface MoodUser {
    id: string;
    name: string;
    picture: string;
    has_mood: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<MoodUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
        const { data: following, error: followingError } = await supabase
            .from('supports')
            .select('supported_id')
            .eq('supporter_id', user.id)
            .eq('status', 'approved');

        if (followingError) throw followingError;
        
        const followedUserIds = following.map(f => f.supported_id);
        const userIds = [user.id, ...followedUserIds];

        const { data: profiles, error: profilesError } = await supabase
            .rpc('get_users_with_mood_status', { p_user_ids: userIds });
        
        if (profilesError) throw profilesError;

        const storyUsers = profiles.map(p => ({
            id: p.id,
            name: p.name,
            picture: p.picture,
            has_mood: p.has_mood
        })).sort((a, b) => {
            const aHasMood = a.has_mood;
            const bHasMood = b.has_mood;
            
            if (a.id === user.id) return -1;
            if (b.id === user.id) return 1;
            if (aHasMood && !bHasMood) return -1;
            if (!aHasMood && bHasMood) return 1;
            return 0;
        });
        
        setStories(storyUsers);
    } catch (error: any) {
        toast({ title: 'Error loading stories', description: error.message, variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);
  
  const me = stories.find(s => s.id === user?.id);
  const otherStories = stories.filter(s => s.id !== user?.id);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <ChatHeader />
      
      <div className="border-b border-border/40">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 p-4">
             {isLoading ? (
                Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
                        <div className="h-2 w-12 rounded-full bg-muted animate-pulse"></div>
                    </div>
                ))
            ) : (
              <>
                {me && (
                   <Link href="/design" className="flex flex-col items-center gap-2 cursor-pointer">
                      <Avatar className="h-16 w-16 border-2 border-background">
                        <AvatarImage src={me.picture} alt={me.name} data-ai-hint="profile picture" />
                        <AvatarFallback>{me.name.charAt(0)}</AvatarFallback>
                         <div className="absolute bottom-0 right-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                            <Plus className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </Avatar>
                      <span className="text-xs font-medium text-muted-foreground">Your Story</span>
                    </Link>
                )}
                {otherStories.map((story) => (
                  <Link key={story.id} href={`/gallery?userId=${story.id}`} className="flex flex-col items-center gap-2 cursor-pointer">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarImage src={story.picture} alt={story.name} data-ai-hint="profile picture" />
                      <AvatarFallback>{story.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-muted-foreground">{story.name}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
      
      <div className="flex-1">
        {/* Page content will go here later */}
      </div>
    </div>
  );
}
