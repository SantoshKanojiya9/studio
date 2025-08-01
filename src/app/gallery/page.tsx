
'use client';

import React from 'react';
import type { EmojiState } from '@/app/design/page';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import { ChatHeader } from '@/components/chat-header';
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
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Face } from '@/app/design/page';
import { motion, useMotionValue } from 'framer-motion';
import Link from 'next/link';

export default function GalleryPage() {
    const [savedEmojis, setSavedEmojis] = React.useState<EmojiState[]>([]);
    const [selectedEmoji, setSelectedEmoji] = React.useState<EmojiState | null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);

    // motion values for the preview face
    const pointerX = useMotionValue(0.5);
    const pointerY = useMotionValue(0.5);
    const featureOffsetX = useMotionValue(0);
    const featureOffsetY = useMotionValue(0);


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
            <div className="flex-1 overflow-y-auto p-1">
                {savedEmojis.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                        {savedEmojis.map(emoji => (
                            <GalleryThumbnail key={emoji.id} emoji={emoji} onSelect={() => setSelectedEmoji(emoji)} />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-center p-4">
                        <p className="text-muted-foreground">No saved emojis yet. Go to the design page to create one!</p>
                    </div>
                )}
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
                                  pointerX={pointerX}
                                  pointerY={pointerY}
                                  featureOffsetX={featureOffsetX}
                                  featureOffsetY={featureOffsetY}
                                  onPan={() => {}}
                                  onPanStart={() => {}}
                                  onPanEnd={() => {}}
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
