
'use client';

import React, { useState, useEffect } from 'react';
import type { EmojiState } from '@/app/design/page';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import { ChatHeader } from '@/components/chat-header';

export default function GalleryPage() {
    const [savedEmojis, setSavedEmojis] = useState<EmojiState[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const savedGallery = localStorage.getItem('savedEmojiGallery');
            if (savedGallery) {
                setSavedEmojis(JSON.parse(savedGallery));
            }
        } catch (error) {
            console.error("Failed to load or parse saved state from localStorage", error);
        }
    }, []);

    const handleDelete = (emojiId: string) => {
        try {
            const updatedEmojis = savedEmojis.filter(emoji => emoji.id !== emojiId);
            setSavedEmojis(updatedEmojis);
            localStorage.setItem('savedEmojiGallery', JSON.stringify(updatedEmojis));
        } catch (error) {
            console.error("Failed to delete emoji from localStorage", error);
        }
    };

    if (!isClient) {
        return (
             <div className="flex h-full w-full flex-col">
                <ChatHeader />
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Loading gallery...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col">
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4">
                {savedEmojis.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {savedEmojis.map(emoji => (
                            <GalleryThumbnail key={emoji.id} emoji={emoji} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No saved emojis yet. Go to the design page to create one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
