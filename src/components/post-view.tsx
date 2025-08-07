
'use client';

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import type { EmojiState } from '@/app/design/page';
import { Face } from '@/components/emoji-face';
import { ClockFace } from '@/components/loki-face';
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
import { ArrowLeft, MoreHorizontal, Edit, Trash2, Heart, MessageCircle, Send, Bookmark, Smile } from 'lucide-react';
import { motion, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { setMood } from '@/app/actions';

interface PostViewProps {
  emojis: EmojiState[];
  initialIndex?: number;
  onClose: () => void;
  onDelete?: (id: string) => void;
  isMoodView?: boolean;
}

export function PostView({ 
    emojis,
    initialIndex = 0, 
    onClose, 
    onDelete, 
    isMoodView = false
}: PostViewProps) {
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [emojiToDelete, setEmojiToDelete] = React.useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<NodeJS.Timeout | null>(null);

  const [currentEmojiState, setCurrentEmojiState] = useState(emojis[currentIndex]);

  useEffect(() => {
    // Sync state if emojis prop changes
    setCurrentEmojiState(emojis[currentIndex]);
  }, [emojis, currentIndex]);

  useEffect(() => {
    if (isMoodView) {
      const timer = setTimeout(() => {
        // After 10 seconds, revert the animation type to 'none'
        setCurrentEmojiState(prev => ({ ...prev, animation_type: 'none' }));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isMoodView]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
        container.scrollTo({
            top: container.offsetHeight * initialIndex,
            behavior: 'auto'
        });
    }
  }, [initialIndex]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrolling.current) {
        clearTimeout(isScrolling.current);
      }
      isScrolling.current = setTimeout(() => {
        const newIndex = Math.round(container.scrollTop / container.offsetHeight);
        if (newIndex >= 0 && newIndex < emojis.length) {
            setCurrentIndex(newIndex);
            setCurrentEmojiState(emojis[newIndex]); // Update state on scroll
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [emojis]);

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

  const handleSetMood = async (emojiId: string) => {
    try {
        await setMood(emojiId);
        toast({
            title: "Mood Updated!",
            description: "Your new mood has been set.",
            variant: "success",
        });
    } catch (error: any) {
        toast({
            title: "Error setting mood",
            description: error.message,
            variant: "destructive",
        });
    }
  };
  
  const featureOffsetX = useMotionValue(0);
  const featureOffsetY = useMotionValue(0);
  
  if (!currentEmojiState) {
    if (emojis.length > 0 && currentIndex >= emojis.length) {
      setCurrentIndex(0); // Reset to first if current is invalid
      if(emojis[0]) setCurrentEmojiState(emojis[0]);
    } else if (emojis.length === 0) {
      onClose(); // Close if there are no emojis left to display
      return null;
    }
    return null;
  }
  
  return (
    <div className="h-full w-full flex flex-col bg-background">
      <header className="flex-shrink-0 flex h-16 items-center justify-between border-b border-border/40 bg-background px-4 z-10">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <h2 className="font-semibold">{isMoodView ? "Mood" : "Post"}</h2>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <div 
        ref={scrollContainerRef}
        className="flex-1 flex flex-col overflow-y-auto snap-y snap-mandatory no-scrollbar"
      >
        {emojis.map((emoji, index) => {
            // Use the centrally managed state for the currently visible emoji
            const emojiToRender = index === currentIndex ? currentEmojiState : emoji;

            let finalEmoji: EmojiState = { ...emojiToRender };
            if (finalEmoji.model === 'loki' && finalEmoji.shape === 'blob') {
              finalEmoji.shape = 'default';
            }

            // Set initial position for rendering
            featureOffsetX.set(finalEmoji.feature_offset_x || 0);
            featureOffsetY.set(finalEmoji.feature_offset_y || 0);

            const postAuthor = finalEmoji.user;

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
                    style={{ backgroundColor: finalEmoji.background_color }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={postAuthor?.picture || "https://placehold.co/64x64.png"} alt={postAuthor?.name} data-ai-hint="profile picture" />
                      <AvatarFallback>{postAuthor?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="ml-3 font-semibold text-sm">{postAuthor?.name || 'User'}</span>
                    {user && postAuthor && user.id === postAuthor.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                           <Link href={`/design?emojiId=${finalEmoji.id}`} className="flex items-center w-full">
                             <Edit className="mr-2 h-4 w-4" />
                             <span>Edit</span>
                           </Link>
                          </DropdownMenuItem>
                          {onDelete && (
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteClick(finalEmoji.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleSetMood(finalEmoji.id)}>
                            <Smile className="mr-2 h-4 w-4" />
                            <span>Set as Mood</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div 
                    className="flex-1 flex items-center justify-center min-h-0"
                    style={{ 
                      backgroundColor: finalEmoji.background_color,
                      filter: finalEmoji.selected_filter && finalEmoji.selected_filter !== 'None' ? `${finalEmoji.selected_filter.toLowerCase().replace('-', '')}(1)` : 'none',
                    }}
                  >
                    {finalEmoji.model === 'loki' ? (
                       <ClockFace 
                          {...finalEmoji}
                          animation_type={finalEmoji.animation_type}
                          color={finalEmoji.emoji_color}
                          isDragging={false}
                          isInteractive={false}
                          feature_offset_x={featureOffsetX}
                          feature_offset_y={featureOffsetY}
                          setColor={() => {}}
                        />
                    ) : (
                       <Face 
                          {...finalEmoji}
                          animation_type={finalEmoji.animation_type}
                          color={finalEmoji.emoji_color}
                          isDragging={false}
                          isInteractive={false}
                          feature_offset_x={featureOffsetX}
                          feature_offset_y={featureOffsetY}
                          setColor={() => {}}
                        />
                    )}
                  </div>

                  <div 
                    className="px-4 pt-2 pb-4"
                    style={{ backgroundColor: finalEmoji.background_color }}
                  >
                      <div className="flex items-center gap-4">
                        <Heart className="h-6 w-6 cursor-pointer" />
                        <MessageCircle className="h-6 w-6 cursor-pointer" />
                        <Send className="h-6 w-6 cursor-pointer" />
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
