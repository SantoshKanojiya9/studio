
'use client';

import React from 'react';
import type { EmojiState } from '@/app/design/page';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import { PostView } from '@/components/post-view';
import { Button } from '@/components/ui/button';
import { Lock, ChevronDown, UserPlus, Grid3x3, Menu } from 'lucide-react';
import { CgClapperBoard } from "react-icons/cg";
import { BsPersonVcard } from "react-icons/bs";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';


const CrownedEggAvatar = () => {
    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
                <radialGradient id="eggGradient" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#f5f5f5" />
                    <stop offset="100%" stopColor="#e0e0e0" />
                </radialGradient>
                <linearGradient id="crownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
            </defs>

            {/* Egg Shadow */}
            <ellipse cx="50" cy="90" rx="35" ry="5" fill="rgba(0,0,0,0.1)" />
            
            {/* Egg */}
            <path 
                d="M 50,15
                   C 25,15 15,40 15,60
                   C 15,85 35,100 50,100
                   C 65,100 85,85 85,60
                   C 85,40 75,15 50,15 Z"
                fill="url(#eggGradient)"
                transform="translate(0, -10)"
            />

            {/* Crown */}
            <g transform="translate(0, -10)">
                <path 
                    d="M 25 30 L 75 30 L 70 45 L 30 45 Z"
                    fill="url(#crownGradient)"
                    stroke="#DAA520"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                <path 
                    d="M 25 30 L 35 15 L 50 25 L 65 15 L 75 30"
                    fill="url(#crownGradient)"
                    stroke="#DAA520"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                <circle cx="35" cy="18" r="3" fill="#FF4136" />
                <circle cx="50" cy="28" r="3" fill="#0074D9" />
                <circle cx="65" cy="18" r="3" fill="#2ECC40" />
            </g>
        </svg>
    );
};


export default function GalleryPage() {
    const [savedEmojis, setSavedEmojis] = React.useState<EmojiState[]>([]);
    const [selectedEmojiId, setSelectedEmojiId] = React.useState<string | null>(null);
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
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
            setSelectedEmojiId(null);
        } catch (error) {
            console.error("Failed to delete emoji from localStorage", error);
        }
    };

    if (!isClient) {
        return (
             <div className="flex h-full w-full flex-col">
                <div className="flex-1 overflow-y-auto">
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">Loading gallery...</p>
                    </div>
                </div>
            </div>
        )
    }

    const ProfileHeader = () => (
        <header className="flex h-16 items-center justify-between bg-background px-4 md:px-6">
            <div className="flex items-center gap-1 font-semibold text-lg">
                <Lock className="h-4 w-4" />
                <span>Profile</span>
            </div>
            <div className="flex items-center gap-2">
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-transparent hover:text-primary">
                            <Menu />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-sm flex flex-col">
                        <SheetHeader className="text-left">
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <div className="flex-1">
                        </div>
        
                        <div className="mt-auto">
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );

    return (
        <div className="flex h-full w-full flex-col overflow-x-hidden">
           {selectedEmojiId ? (
                <PostView 
                    emojis={savedEmojis} 
                    selectedId={selectedEmojiId}
                    onClose={() => setSelectedEmojiId(null)}
                    onDelete={handleDelete}
                />
           ) : (
             <>
                <ProfileHeader />
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="bg-zinc-800/50 rounded-lg m-4 p-4">
                        <div className="flex items-center gap-2">
                           <div className="w-20 h-20 flex-shrink-0">
                                <CrownedEggAvatar />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-1 text-lg font-semibold">
                                    <span>santosh.r.k_</span>
                                    <ChevronDown className="h-5 w-5" />
                                </div>
                                <div className="flex flex-1 items-center justify-around text-center mt-2">
                                    <div>
                                        <p className="font-bold text-base">3</p>
                                        <p className="text-sm text-muted-foreground">posts</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-base">524</p>
                                        <p className="text-sm text-muted-foreground">followers</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-base">65</p>
                                        <p className="text-sm text-muted-foreground">following</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button variant="secondary" className="flex-1">Edit profile</Button>
                            <Button variant="secondary" className="flex-1">Share profile</Button>
                            <Button variant="secondary" size="icon"><UserPlus className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    <div className="border-t border-b border-border">
                        <div className="flex items-center justify-center p-2">
                             <span className="font-semibold text-sm">Collections</span>
                        </div>
                    </div>
                    <div className="p-1">
                        {savedEmojis.length > 0 ? (
                            <motion.div 
                                layout
                                className="grid grid-cols-3 gap-1"
                            >
                                {savedEmojis.map(emoji => (
                                    <GalleryThumbnail key={emoji.id} emoji={emoji} onSelect={() => setSelectedEmojiId(emoji.id)} />
                                ))}
                            </motion.div>
                        ) : (
                             <div className="flex flex-col h-full items-center justify-center text-center p-8 gap-4">
                                <div className="border-2 border-foreground rounded-full p-4">
                                    <Grid3x3 className="h-12 w-12" />
                                 </div>
                                <h2 className="text-2xl font-bold">Capture the moment with a friend</h2>
                                <Link href="/design" className="text-primary font-semibold">Create your first post</Link>
                            </div>
                        )}
                    </div>
                </div>
            </>
           )}
        </div>
    );
}
