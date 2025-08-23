'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryRing } from '@/components/story-ring';
import type { User } from '@supabase/supabase-js';
import type { Mood } from '@/components/post-view';
import { TimeRemaining } from './time-remaining';
import Image from 'next/image';

interface UserProfile {
    id: string;
    name: string;
    picture: string;
}

interface MoodStoriesProps {
    user: UserProfile | null;
    moods: Mood[];
    isLoading: boolean;
    onSelectMood: (index: number) => void;
}

const MoodStories = memo(({ user, moods, isLoading, onSelectMood }: MoodStoriesProps) => {
    
    const ownMood = moods.find(m => m.mood_user_id === user?.id);
    const userHasMood = !!ownMood;

    return (
        <div className="border-b border-border/40">
            <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 p-4">
                {!isLoading && user && (
                    <Link href={userHasMood ? "#" : "/gallery"} className="flex flex-col items-center gap-2 cursor-pointer" onClick={userHasMood ? (e) => { e.preventDefault(); onSelectMood(moods.findIndex(m => m.mood_user_id === user?.id)) } : undefined}>
                        <StoryRing hasStory={userHasMood} isViewed={ownMood?.is_viewed}>
                             <Avatar className="h-16 w-16 border-2 border-background">
                                <AvatarImage src={user.picture} alt={"Your Mood"} data-ai-hint="profile picture" className="rounded-full" />
                                <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                            </Avatar>
                        </StoryRing>
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
                    moods.filter(mood => mood.mood_user_id !== user?.id).map((mood) => (
                    <div key={mood.mood_id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onSelectMood(moods.findIndex(m => m.mood_id === mood.mood_id))}>
                        <StoryRing hasStory={true} isViewed={mood.is_viewed}>
                        <Avatar className="h-16 w-16 border-2 border-background">
                            {mood.mood_user?.picture && <AvatarImage src={mood.mood_user.picture} alt={mood.mood_user.name} data-ai-hint="profile picture" className="rounded-full" />}
                            <AvatarFallback>{mood.mood_user?.name ? mood.mood_user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        </StoryRing>
                        <span className="text-xs font-medium text-muted-foreground">{mood.mood_user?.name}</span>
                    </div>
                    ))
                )}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    )
});

MoodStories.displayName = 'MoodStories';
export default MoodStories;
