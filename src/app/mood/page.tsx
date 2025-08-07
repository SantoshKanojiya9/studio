
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MoodHeader } from '@/components/mood-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, PlusSquare, Loader2, Smile } from 'lucide-react';
import type { EmojiState } from '@/app/design/page';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PostView = dynamic(() => 
  import('@/components/post-view').then(mod => mod.PostView),
  {
    loading: () => <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>,
    ssr: false 
  }
);

interface Mood extends EmojiState {
  mood_id: number;
}

const StoryRing = ({ hasStory, children }: { hasStory: boolean; children: React.ReactNode }) => {
  if (!hasStory) {
    return <>{children}</>;
  }
  return (
    <div className="rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-400">
      {children}
    </div>
  );
};

export default function MoodPage() {
    const { user, supabase } = useAuth();
    const { toast } = useToast();
    const [moods, setMoods] = useState<Mood[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);

    const fetchMoods = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            // Get users the current user is following + the user themselves
            const { data: following, error: followingError } = await supabase
                .from('supports')
                .select('supported_id')
                .eq('supporter_id', user.id);
            
            if (followingError) throw followingError;

            const userIds = [...following.map(f => f.supported_id), user.id];
            
            // Get moods for those users created in the last 24 hours
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const { data: moodData, error: moodError } = await supabase
                .from('moods')
                .select(`
                    id, 
                    created_at,
                    emoji:emojis!inner(*, user:users!inner(id, name, picture))
                `)
                .in('user_id', userIds)
                .gte('created_at', twentyFourHoursAgo)
                .order('created_at', { ascending: false });

            if (moodError) throw moodError;

            const formattedMoods = moodData.map(m => ({
                ...(m.emoji as unknown as EmojiState),
                mood_id: m.id,
                created_at: m.created_at,
            })).sort((a, b) => {
                // Sort own mood to the front
                if (a.user_id === user.id) return -1;
                if (b.user_id === user.id) return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            setMoods(formattedMoods as Mood[]);

        } catch (error: any) {
            console.error('Failed to fetch moods', error);
            toast({
                title: "Could not load moods",
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, supabase, toast]);

    useEffect(() => {
        fetchMoods();
    }, [fetchMoods]);
    
    const userHasMood = moods.some(m => m.user_id === user?.id);

    const handleSelectMood = (mood: Mood) => {
        // Find all moods from this user to pass to PostView
        const userPosts = moods.filter(m => m.user_id === mood.user_id);
        setSelectedMoodId(mood.mood_id);
    };
    
    const selectedMoodIndex = selectedMoodId ? moods.findIndex(e => e.mood_id === selectedMoodId) : -1;

    if (selectedMoodId && selectedMoodIndex !== -1) {
        // Temporarily set animation to random for 10s
        const tempMoods = moods.map(m =>
          m.mood_id === selectedMoodId ? { ...m, animation_type: 'random' as const } : m
        );
        
        return (
            <PostView 
                emojis={tempMoods}
                initialIndex={selectedMoodIndex}
                onClose={() => {
                    setSelectedMoodId(null);
                    // Optionally reset animation type if needed when closing
                }}
                isMoodView={true} // Special prop for mood-specific behavior
            />
        )
    }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <MoodHeader />
      
      <div className="border-b border-border/40">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 p-4">
            {!isLoading && !userHasMood && (
                <Link href="/gallery" className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="rounded-full p-[2px] bg-border/50">
                        <Avatar className="h-16 w-16 border-2 border-background">
                            <AvatarImage src={user?.picture} alt={"Your Mood"} data-ai-hint="profile picture" />
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                            <div className="absolute bottom-0 right-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                                <Plus className="h-3 w-3 text-primary-foreground" />
                            </div>
                        </Avatar>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Your Mood</span>
                </Link>
            )}

            {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
                        <div className="h-2 w-12 rounded-full bg-muted animate-pulse"></div>
                    </div>
                ))
            ) : (
                moods.map((mood) => (
                  <div key={mood.mood_id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleSelectMood(mood)}>
                    <StoryRing hasStory={true}>
                      <Avatar className="h-16 w-16 border-2 border-background">
                        <AvatarImage src={mood.user?.picture} alt={mood.user?.name} data-ai-hint="profile picture" />
                        <AvatarFallback>{mood.user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </StoryRing>
                    <span className="text-xs font-medium text-muted-foreground">{mood.user_id === user?.id ? "Your Mood" : mood.user?.name}</span>
                  </div>
                ))
            )}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 text-muted-foreground">
        {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin" />
        ) : moods.length > 0 ? (
            <>
                <Smile className="h-16 w-16" />
                <h2 className="text-2xl font-bold text-foreground">Welcome to your Feed</h2>
                <p>Tap on a mood above to view it. Follow more people to see more moods here.</p>
                <Link href="/explore" className="text-primary font-semibold">Explore users</Link>
            </>
        ) : (
            <>
                <PlusSquare className="h-16 w-16" />
                <h2 className="text-2xl font-bold text-foreground">Nothing in your feed yet</h2>
                <p>When you follow people, their moods will appear here. Add your own mood from one of your posts!</p>
                <Link href="/gallery" className="text-primary font-semibold">Go to your gallery</Link>
            </>
        )}
      </div>
    </div>
  );
}
