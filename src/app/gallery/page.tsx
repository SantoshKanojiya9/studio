
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
                <div className="flex-1 overflow-y-auto p-4">
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
                <div className="flex-1 overflow-y-auto">
                    <div className="bg-[#2c1f17] rounded-lg m-4 p-6">
                        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                           <div className="w-24 h-24 flex items-center justify-center">
                               {/* Emoji removed as requested */}
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-1 font-semibold text-base">
                                    <span>santosh.r.k_</span>
                                    <ChevronDown className="h-5 w-5" />
                                </div>
                                <div className="flex items-center text-center mt-2 gap-4">
                                    <div>
                                        <p className="font-bold text-base">{savedEmojis.length}</p>
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

                    <Tabs defaultValue="grid" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-transparent">
                            <TabsTrigger value="grid" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                                <Grid3x3 />
                            </TabsTrigger>
                            <TabsTrigger value="reels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                                <CgClapperBoard size={24} />
                            </TabsTrigger>
                            <TabsTrigger value="tagged" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">
                                <BsPersonVcard size={24} />
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="grid" className="p-1">
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
                        </TabsContent>
                        <TabsContent value="reels" className="flex items-center justify-center p-8 text-muted-foreground">Reels coming soon!</TabsContent>
                        <TabsContent value="tagged" className="flex items-center justify-center p-8 text-muted-foreground">Tagged posts coming soon!</TabsContent>
                    </Tabs>
                </div>
            </>
           )}
        </div>
    );
}
