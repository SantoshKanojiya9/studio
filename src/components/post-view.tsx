
'use client';

import React, { useEffect, useRef } from 'react';
import type { EmojiState } from '@/app/design/page';
import { Face, ClockFace } from '@/app/design/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MoreHorizontal, Edit, Trash2, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

interface PostViewProps {
  emojis: EmojiState[];
  selectedId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function PostView({ emojis, selectedId, onClose, onDelete }: PostViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [emojiToDelete, setEmojiToDelete] = React.useState<string | null>(null);

  useEffect(() => {
    const postElement = document.getElementById(`post-${selectedId}`);
    if (postElement) {
      postElement.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [selectedId]);

  const handleDeleteClick = (id: string) => {
    setEmojiToDelete(id);
  };
  
  const confirmDelete = () => {
    if (emojiToDelete) {
      onDelete(emojiToDelete);
      setEmojiToDelete(null);
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-background">
      <header className="absolute top-0 left-0 right-0 z-10 flex h-16 items-center justify-between bg-background/80 px-4 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <h2 className="font-semibold">Posts</h2>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pt-16 snap-y snap-mandatory">
        <AnimatePresence>
          {emojis.map((emoji) => (
            <motion.div
              key={emoji.id}
              id={`post-${emoji.id}`}
              className="h-full w-full flex-shrink-0 snap-start flex flex-col"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div 
                className="flex items-center px-4 py-2"
                style={{ backgroundColor: emoji.backgroundColor }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/64x64.png" alt="@sk" data-ai-hint="male profile" />
                  <AvatarFallback>SK</AvatarFallback>
                </Avatar>
                <span className="ml-3 font-semibold text-sm">santosh.r.k_</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                       <Link href={`/design?emojiId=${emoji.id}`}>
                         <Edit className="mr-2 h-4 w-4" />
                         <span>Edit</span>
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(emoji.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div 
                className="flex-1 flex items-center justify-center min-h-0"
                style={{ 
                  backgroundColor: emoji.backgroundColor,
                  filter: emoji.selectedFilter && emoji.selectedFilter !== 'None' ? `${emoji.selectedFilter.toLowerCase().replace('-', '')}(1)` : 'none',
                }}
              >
                {emoji.model === 'loki' ? (
                   <ClockFace 
                      {...emoji}
                      color={emoji.emojiColor}
                      isDragging={false}
                    />
                ) : (
                   <Face 
                      {...emoji}
                      color={emoji.emojiColor}
                      isDragging={false}
                      onPan={() => {}}
                      onPanStart={() => {}}
                      onPanEnd={() => {}}
                    />
                )}
              </div>

              <div 
                className="px-4 pt-2 pb-4"
                style={{ backgroundColor: emoji.backgroundColor }}
              >
                  <div className="flex items-center gap-4">
                    <Heart className="h-6 w-6 cursor-pointer" />
                    <MessageCircle className="h-6 w-6 cursor-pointer" />
                    <Send className="h-6 w-6 cursor-pointer" />
                    <Bookmark className="h-6 w-6 cursor-pointer ml-auto" />
                  </div>
                  <p className="text-sm font-semibold mt-2">1,234 likes</p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">santosh.r.k_</span>
                    {' '}My new creation!
                  </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {emojiToDelete && (
        <AlertDialog open={!!emojiToDelete} onOpenChange={(isOpen) => !isOpen && setEmojiToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do you want to delete this emoji? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEmojiToDelete(null)}>No</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>Yes</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
