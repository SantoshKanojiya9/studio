
'use client';

import React from 'react';
import type { EmojiState } from '@/app/design/page';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, Edit, Lock, ChevronDown, UserPlus, Grid3x3, Menu } from 'lucide-react';
import { CgClapperBoard } from "react-icons/cg";
import { BsPersonVcard } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Face } from '@/app/design/page';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    const [selectedEmoji, setSelectedEmoji] = React.useState<EmojiState | null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);

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
            setSelectedEmoji(null); // Close the preview
            setIsAlertOpen(false); // Close the alert dialog
        } catch (error) {
            console.error("Failed to delete emoji from localStorage", error);
        }
    };
    
    const handleOpenAlert = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAlertOpen(true);
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
                <span>santosh.r.k_</span>
                <ChevronDown className="h-5 w-5" />
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
        <div className="flex h-full w-full flex-col">
            <ProfileHeader />
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-2 border-background">
                                <AvatarImage src="https://placehold.co/96x96.png" alt="santosh.r.k_" data-ai-hint="profile picture" />
                                <AvatarFallback>SRK</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-primary rounded-full flex items-center justify-center border-4 border-background">
                                <span className="text-primary-foreground text-lg font-bold">+</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-center">
                            <div>
                                <p className="font-bold text-lg">{savedEmojis.length}</p>
                                <p className="text-sm text-muted-foreground">posts</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg">524</p>
                                <p className="text-sm text-muted-foreground">followers</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg">65</p>
                                <p className="text-sm text-muted-foreground">following</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="font-semibold">SK</h2>
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
                            <div className="grid grid-cols-3 gap-1">
                                {savedEmojis.map(emoji => (
                                    <GalleryThumbnail key={emoji.id} emoji={emoji} onSelect={() => setSelectedEmoji(emoji)} />
                                ))}
                            </div>
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

            {selectedEmoji && (
                <Dialog open={!!selectedEmoji} onOpenChange={(isOpen) => !isOpen && setSelectedEmoji(null)}>
                    <DialogContent className="p-0 border-0 bg-transparent shadow-none w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <DialogHeader className="sr-only">
                          <DialogTitle>Emoji Preview</DialogTitle>
                        </DialogHeader>
                        <div 
                            className="relative w-full h-full flex items-center justify-center transition-colors duration-300"
                            style={{ backgroundColor: selectedEmoji.backgroundColor }}
                        >
                            <div className="absolute top-2 right-2 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-white hover:bg-black/20 hover:text-white"
                                            aria-label="More options"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/design?emojiId=${selectedEmoji.id}`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={handleOpenAlert}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                           <motion.div
                              className="w-80 h-96 flex items-center justify-center select-none"
                              style={{ 
                                filter: selectedEmoji.selectedFilter && selectedEmoji.selectedFilter !== 'None' ? `${selectedEmoji.selectedFilter.toLowerCase().replace('-', '')}(1)` : 'none',
                              }}
                            >
                                <Face 
                                  {...selectedEmoji}
                                  color={selectedEmoji.emojiColor}
                                  isDragging={false}
                                />
                           </motion.div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
             {selectedEmoji && (
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitleComponent>Are you sure?</AlertDialogTitleComponent>
                            <AlertDialogDescription>
                                Do you want to delete this emoji? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>No</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(selectedEmoji.id)}>Yes</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             )}
        </div>
    );
}
