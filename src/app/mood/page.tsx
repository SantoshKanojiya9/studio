
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MoodHeader } from '@/components/mood-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Loader2, Smile } from 'lucide-react';
import type { EmojiState } from '@/app/design/page';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';

const PostView = dynamic(() => 
  import('@/components/post-view').then(mod => mod.PostView),
  {
    loading: () => <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>,
    ssr: false 
  }
);

interface Mood extends EmojiState {
  mood_id: number;
  mood_created_at: string;
  mood_user_id: string;
  is_viewed?: boolean;
}

const StoryRing = ({ hasStory, isViewed, children }: { hasStory: boolean; isViewed?: boolean; children: React.ReactNode }) => {
  if (!hasStory) {
    return <>{children}</>;
  }
  return (
    <div className={`rounded-full p-[2px] ${isViewed ? 'bg-border/50' : 'bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-400'}`}>
      {children}
    </div>
  );
};

export default function MoodPage() {
    const { user, supabase } = useAuth();
    const { toast } = useToast();
    const [moods, setMoods] = useState<Mood[]>([]);
    const [feedPosts, setFeedPosts] = useState<EmojiState[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(null);
    const [viewedMoods, setViewedMoods] = useState<Set<number>>(new Set());
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const fetchFeedContent = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            const { data: following, error: followingError } = await supabase
                .from('supports')
                .select('supported_id')
                .eq('supporter_id', user.id);
            
            if (followingError) throw followingError;

            const userIds = [...following.map(f => f.supported_id), user.id];
            
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            // Fetch moods
            const { data: moodData, error: moodError } = await supabase
                .from('moods')
                .select(`
                    id,
                    user_id,
                    created_at,
                    emoji:emojis!inner(*, user:users!inner(id, name, picture)),
                    views:mood_views(viewer_id)
                `)
                .in('user_id', userIds)
                .gte('created_at', twentyFourHoursAgo)
                .order('created_at', { ascending: false });

            if (moodError) throw moodError;
            
            const myViews = new Set(moodData.flatMap(m => m.views.map(v => m.id)));

            const formattedMoods = moodData.map(m => {
                const isViewed = myViews.has(m.id);
                return {
                    ...(m.emoji as unknown as EmojiState),
                    mood_id: m.id,
                    mood_created_at: m.created_at,
                    mood_user_id: m.user_id,
                    is_viewed: isViewed
                }
            }).sort((a, b) => {
                if (a.mood_user_id === user.id) return -1;
                if (b.mood_user_id === user.id) return 1;
                if (a.is_viewed && !b.is_viewed) return 1;
                if (!a.is_viewed && b.is_viewed) return -1;
                return new Date(b.mood_created_at).getTime() - new Date(a.mood_created_at).getTime();
            });

            setMoods(formattedMoods as Mood[]);
            
            // Fetch posts for feed
            const { data: postData, error: postError } = await supabase
                .from('emojis')
                .select('*, user:users!inner(id, name, picture)')
                .in('user_id', userIds)
                .order('created_at', { ascending: false });

            if (postError) throw postError;

            setFeedPosts(postData as unknown as EmojiState[]);


        } catch (error: any) {
            console.error('Failed to fetch feed content', error);
            toast({
                title: "Could not load your feed",
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, supabase, toast]);

    useEffect(() => {
        fetchFeedContent();
    }, [fetchFeedContent]);
    
    const userHasMood = moods.some(m => m.mood_user_id === user?.id);

    const handleSelectMood = (index: number) => {
        setSelectedMoodIndex(index);
        const moodId = moods[index].mood_id;
        setViewedMoods(prev => new Set(prev).add(moodId));
    };
    
    const handleSelectPost = (postId: string) => {
        setSelectedPostId(postId);
    };

    const handleOnCloseMood = () => {
        setSelectedMoodIndex(null);
        // Optimistically update viewed state
        const newMoods = moods.map(m => ({
            ...m,
            is_viewed: viewedMoods.has(m.id) ? true : m.is_viewed,
        })).sort((a, b) => {
            if (a.mood_user_id === user?.id) return -1;
            if (b.mood_user_id === user?.id) return 1;
            if (a.is_viewed && !b.is_viewed) return 1;
            if (!a.is_viewed && b.is_viewed) return -1;
            return new Date(b.mood_created_at).getTime() - new Date(a.mood_created_at).getTime();
        });
        setMoods(newMoods);
    }
    
    if (selectedMoodIndex !== null) {
        return (
            <PostView 
                emojis={moods}
                initialIndex={selectedMoodIndex}
                onClose={handleOnCloseMood}
                isMoodView={true}
                onDelete={(moodId) => {
                    setMoods(moods.filter(m => m.mood_id !== parseInt(moodId)));
                    fetchFeedContent(); // Re-fetch after deletion
                }}
            />
        )
    }

    if (selectedPostId !== null) {
        const postIndex = feedPosts.findIndex(p => p.id === selectedPostId);
        return (
             <PostView 
                emojis={feedPosts}
                initialIndex={postIndex}
                onClose={() => setSelectedPostId(null)}
                onDelete={(deletedId) => {
                    setFeedPosts(feedPosts.filter(p => p.id !== deletedId));
                    fetchFeedContent(); // Re-fetch
                }}
            />
        )
    }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <MoodHeader />
      <div className="flex-1 overflow-y-auto no-scrollbar">
      
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

                {isLoading && moods.length === 0 ? (
                    Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="h-16 w-16 rounded-full bg-muted animate-pulse"></div>
                            <div className="h-2 w-12 rounded-full bg-muted animate-pulse"></div>
                        </div>
                    ))
                ) : (
                    moods.map((mood, index) => (
                    <div key={mood.mood_id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => handleSelectMood(index)}>
                        <StoryRing hasStory={true} isViewed={mood.is_viewed || viewedMoods.has(mood.mood_id)}>
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
      
        <div className="flex-1">
            {isLoading ? (
                <div className="flex h-full w-full items-center justify-center pt-10">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
            ) : feedPosts.length > 0 ? (
                 <div className="p-1">
                    <div className="grid grid-cols-3 gap-1">
                        {feedPosts.map((post) => (
                            <GalleryThumbnail key={post.id} emoji={post} onSelect={() => handleSelectPost(post.id)} />
                        ))}
                    </div>
                 </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 text-muted-foreground">
                    <Smile className="h-16 w-16" />
                    <h2 className="text-2xl font-bold text-foreground">Welcome to your Feed</h2>
                    <p>When you follow people, their posts and moods will appear here.</p>
                    <Link href="/explore" className="text-primary font-semibold">Explore users to follow</Link>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
