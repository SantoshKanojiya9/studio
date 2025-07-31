
'use client';

import React from 'react';
import { ChatHeader } from '@/components/chat-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const stories = [
  { id: 1, username: 'Neil', avatar: 'https://placehold.co/64x64.png', hasStory: true, isMe: true },
  { id: 2, username: 'Alice', avatar: 'https://placehold.co/64x64.png', hasStory: true },
  { id: 3, username: 'Bob', avatar: 'https://placehold.co/64x64.png', hasStory: true },
  { id: 4, username: 'Charlie', avatar: 'https://placehold.co/64x64.png', hasStory: false },
  { id: 5, username: 'David', avatar: 'https://placehold.co/64x64.png', hasStory: true },
  { id: 6, username: 'Eve', avatar: 'https://placehold.co/64x64.png', hasStory: false },
  { id: 7, username: 'Frank', avatar: 'https://placehold.co/64x64.png', hasStory: true },
  { id: 8, username: 'Grace', avatar: 'https://placehold.co/64x64.png', hasStory: false },
  { id: 9, username: 'Heidi', avatar: 'https://placehold.co/64x64.png', hasStory: true },
  { id: 10, username: 'Ivan', avatar: 'https://placehold.co/64x64.png', hasStory: false },
];

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


export default function ChatPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <ChatHeader />
      
      <div className="border-b border-border/40">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 p-4">
            {stories.map((story) => (
              <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer">
                <StoryRing hasStory={story.hasStory}>
                  <Avatar className="h-16 w-16 border-2 border-background">
                    <AvatarImage src={story.avatar} alt={story.username} data-ai-hint="profile picture" />
                    <AvatarFallback>{story.username.charAt(0)}</AvatarFallback>
                     {story.isMe && (
                        <div className="absolute bottom-0 right-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                            <Plus className="h-3 w-3 text-primary-foreground" />
                        </div>
                    )}
                  </Avatar>
                </StoryRing>
                <span className="text-xs font-medium text-muted-foreground">{story.isMe ? "Your Story" : story.username}</span>
              </div>
            ))}
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
