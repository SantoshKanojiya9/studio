
'use client';

import React, { useState, useEffect } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Loader2 } from 'lucide-react';
import { StoryRing } from '@/components/story-ring';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabaseClient';
import type { EmojiState } from '@/app/design/page';
import dynamic from 'next/dynamic';
import { PostView } from '@/components/post-view';

const MemoizedPostView = dynamic(() => import('@/components/post-view').then(mod => mod.PostView), {
  loading: () => <div className="flex h-full w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>,
  ssr: false
});

interface StoryUser {
    id: string;
    name: string;
    picture: string;
    mood: Mood | null;
}

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

export default function ChatPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStoryUser, setSelectedStoryUser] = useState<StoryUser | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      if (!user) return;
      setIsLoading(true);

      // 1. Get users the current user is following
      const { data: following, error: followingError } = await supabase
          .from('supports')
          .select('supported_id')
          .eq('supporter_id', user.id)
          .eq('status', 'approved');

      if (followingError) {
          console.error('Error fetching following users:', followingError);
          setIsLoading(false);
          return;
      }
      
      const followedUserIds = following.map(f => f.supported_id);
      const userIds = [user.id, ...followedUserIds];

      // 2. Get profiles for all these users
      const { data: profiles, error: profilesError } = await supabase
        .from('users')
        .select('id, name, picture')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setIsLoading(false);
        return;
      }
      
      // 3. Get all active moods for these users
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: moodsData, error: moodError } = await supabase
        .from('moods')
        .select('id, user_id, created_at, emoji:emojis!inner(*, user:users!inner(id, name, picture)), views:mood_views(viewer_id)')
        .in('user_id', userIds)
        .gte('created_at', twentyFourHoursAgo);
      
      if (moodError) {
        console.error('Error fetching moods:', moodError);
      }

      // 4. Map moods to users
      const moodsByUserId = new Map<string, Mood>();
      if (moodsData) {
        moodsData.forEach(m => {
          const isViewed = (m.views as unknown as { viewer_id: string }[]).some(v => v.viewer_id === user.id);
          moodsByUserId.set(m.user_id, {
            ...(m.emoji as EmojiState),
            mood_id: m.id,
            mood_created_at: m.created_at,
            mood_user_id: m.user_id,
            mood_user: m.emoji.user,
            is_viewed: isViewed,
          });
        });
      }

      // 5. Combine data and sort
      const storyUsers = profiles.map(p => ({
        id: p.id,
        name: p.name,
        picture: p.picture,
        mood: moodsByUserId.get(p.id) || null
      })).sort((a, b) => {
        const aHasMood = !!a.mood;
        const bHasMood = !!b.mood;
        
        if (a.id === user.id) return -1;
        if (b.id === user.id) return 1;
        if (aHasMood && !bHasMood) return -1;
        if (!aHasMood && bHasMood) return 1;
        if (a.mood && b.mood) {
          const aIsViewed = a.mood.is_viewed;
          const bIsViewed = b.mood.is_viewed;
          if (!aIsViewed && bIsViewed) return -1;
          if (aIsViewed && !bIsViewed) return 1;
        }
        return 0; // Or sort by name if needed
      });
      
      setStories(storyUsers);
      setIsLoading(false);
    };

    fetchStories();
  }, [user]);
  
  const handleStoryClick = (storyUser: StoryUser) => {
      if (storyUser.mood) {
          setSelectedStoryUser(storyUser);
      }
  };

  const handleOnCloseMood = (updatedMoods?: any[]) => {
      if (updatedMoods && selectedStoryUser) {
          const viewedMood = updatedMoods[0];
          setStories(prevStories => prevStories.map(story => {
              if (story.id === selectedStoryUser.id && story.mood) {
                  return { ...story, mood: { ...story.mood, is_viewed: true } };
              }
              return story;
          }));
      }
      setSelectedStoryUser(null);
  };
  
  const me = stories.find(s => s.id === user?.id);
  const otherStories = stories.filter(s => s.id !== user?.id);

  if (selectedStoryUser && selectedStoryUser.mood) {
      return (
          <MemoizedPostView
              emojis={[selectedStoryUser.mood]}
              initialIndex={0}
              onClose={handleOnCloseMood}
              isMoodView={true}
          />
      );
  }

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
                   <div key={me.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleStoryClick(me)}>
                      <StoryRing hasStory={!!me.mood} isViewed={me.mood?.is_viewed}>
                        <Avatar className="h-16 w-16 border-2 border-background">
                          <AvatarImage src={me.picture} alt={me.name} data-ai-hint="profile picture" />
                          <AvatarFallback>{me.name.charAt(0)}</AvatarFallback>
                           <div className="absolute bottom-0 right-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                              <Plus className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </Avatar>
                      </StoryRing>
                      <span className="text-xs font-medium text-muted-foreground">Your Story</span>
                    </div>
                )}
                {otherStories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleStoryClick(story)}>
                    <StoryRing hasStory={!!story.mood} isViewed={story.mood?.is_viewed}>
                      <Avatar className="h-16 w-16 border-2 border-background">
                        <AvatarImage src={story.picture} alt={story.name} data-ai-hint="profile picture" />
                        <AvatarFallback>{story.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </StoryRing>
                    <span className="text-xs font-medium text-muted-foreground">{story.name}</span>
                  </div>
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
