
'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { motion, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';


interface PostViewProps {
  emojis: EmojiState[];
  initialIndex?: number;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onShare?: (emoji: EmojiState) => void;
}

export function PostView({ 
    emojis,
    initialIndex = 0, 
    onClose, 
    onDelete, 
    onShare 
}: PostViewProps) {
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [emojiToDelete, setEmojiToDelete] = React.useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && emojis) { // Only handle scroll logic if it's a list
        container.scrollTo({
            top: container.offsetHeight * initialIndex,
            behavior: 'auto'
        });

        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const newIndex = Math.round(scrollContainerRef.current.scrollTop / scrollContainerRef.current.offsetHeight);
                if (newIndex < emojis.length) {
                    setCurrentIndex(newIndex);
                }
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [initialIndex, emojis]);

  const handleDeleteClick = (id: string) => {
    if (!onDelete) return;
    setEmojiToDelete(id);
  };
  
  const confirmDelete = () => {
    if (emojiToDelete && onDelete) {
      onDelete(emojiToDelete);
      setEmojiToDelete(null);
    }
  };

  const handleShareClick = async (emoji: EmojiState) => {
    if (onShare) {
      onShare(emoji);
      return;
    }
    
    // Fallback share for explore page
    const url = `${window.location.origin}/design?emojiId=${emoji.id}`;
    const shareData = {
      title: 'Check out this creation on Edengram!',
      text: `I made this cool emoji on Edengram.`,
      url: url,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
             navigator.clipboard.writeText(url).then(() => {
                toast({
                    title: 'Link copied!',
                    description: 'A shareable link has been copied to your clipboard.',
                    variant: 'success'
                });
             });
        }
    } catch (err) {
        console.error("Share failed", err);
         toast({
            title: 'Could not share',
            description: 'There was an error trying to share.',
            variant: 'destructive'
        });
    }
  };
  
  const featureOffsetX = useMotionValue(0);
  const featureOffsetY = useMotionValue(0);
  
  const currentEmoji = emojis[currentIndex];
  
  if (!currentEmoji) {
    if (emojis.length > 0 && currentIndex >= emojis.length) {
      setCurrentIndex(0); // Reset to first if current is invalid
    } else if (emojis.length === 0) {
      onClose(); // Close if there are no emojis left to display
      return null;
    }
    return null;
  }
  
  const author = currentEmoji.user;

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <header className="flex-shrink-0 flex h-16 items-center justify-between border-b border-border/40 bg-background px-4 z-10">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <h2 className="font-semibold">Post</h2>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <div 
        ref={scrollContainerRef}
        className="flex-1 flex flex-col overflow-y-auto snap-y snap-mandatory no-scrollbar"
      >
        {emojis.map((emoji) => {
            let emojiToRender: EmojiState = { ...emoji };
            if (emojiToRender.model === 'loki' && emojiToRender.shape === 'blob') {
              emojiToRender.shape = 'default';
            }

            // Set initial position for rendering
            featureOffsetX.set(emojiToRender.featureOffsetX || 0);
            featureOffsetY.set(emojiToRender.featureOffsetY || 0);

            const postAuthor = emoji.user;

            return (
                <motion.div
                    key={emoji.id}
                    id={`post-${emoji.id}`}
                    className="w-full h-full flex-shrink-0 flex flex-col snap-center"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                  <div 
                    className="flex items-center px-4 py-2"
                    style={{ backgroundColor: emojiToRender.backgroundColor }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={postAuthor?.picture || "https://placehold.co/64x64.png"} alt={postAuthor?.name} data-ai-hint="profile picture" />
                      <AvatarFallback>{postAuthor?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="ml-3 font-semibold text-sm">{postAuthor?.name || 'User'}</span>
                    {onDelete && user && postAuthor && user.id === postAuthor.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                           <Link href={`/design?emojiId=${emojiToRender.id}`} className="flex items-center w-full">
                             <Edit className="mr-2 h-4 w-4" />
                             <span>Edit</span>
                           </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteClick(emojiToRender.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div 
                    className="flex-1 flex items-center justify-center min-h-0"
                    style={{ 
                      backgroundColor: emojiToRender.backgroundColor,
                      filter: emojiToRender.selectedFilter && emojiToRender.selectedFilter !== 'None' ? `${emojiToRender.selectedFilter.toLowerCase().replace('-', '')}(1)` : 'none',
                    }}
                  >
                    {emojiToRender.model === 'loki' ? (
                       <ClockFace 
                          {...emojiToRender}
                          animation_type={emojiToRender.animation_type}
                          color={emojiToRender.emojiColor}
                          isDragging={false}
                          isInteractive={false}
                          featureOffsetX={featureOffsetX}
                          featureOffsetY={featureOffsetY}
                          setColor={() => {}}
                        />
                    ) : (
                       <Face 
                          {...emojiToRender}
                          animation_type={emojiToRender.animation_type}
                          color={emojiToRender.emojiColor}
                          isDragging={false}
                          onPan={() => {}}
                          onPanStart={() => {}}
                          onPanEnd={() => {}}
                          featureOffsetX={featureOffsetX}
                          featureOffsetY={featureOffsetY}
                          setColor={() => {}}
                        />
                    )}
                  </div>

                  <div 
                    className="px-4 pt-2 pb-4"
                    style={{ backgroundColor: emojiToRender.backgroundColor }}
                  >
                      <div className="flex items-center gap-4">
                        <Heart className="h-6 w-6 cursor-pointer" />
                        <MessageCircle className="h-6 w-6 cursor-pointer" />
                        <Send className="h-6 w-6 cursor-pointer" onClick={() => handleShareClick(emojiToRender)} />
                        <Bookmark className="h-6 w-6 cursor-pointer ml-auto" />
                      </div>
                      <p className="text-sm font-semibold mt-2">1,234 likes</p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold">{postAuthor?.name || 'User'}</span>
                        {' '}My new creation!
                      </p>
                  </div>
                </motion.div>
              )
          })}
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
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, delete it</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

