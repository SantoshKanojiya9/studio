
'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { ArrowLeft, MoreHorizontal, Edit, Trash2, Heart, MessageCircle, Send, Bookmark, Smile, X } from 'lucide-react';
import { motion, useMotionValue, AnimatePresence, useAnimation } from 'framer-motion';
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

const StoryProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-500/50 rounded-full h-1">
        <motion.div 
            className="bg-white h-1 rounded-full"
            style={{ width: `${progress * 100}%` }}
        />
    </div>
)

export function PostView({ 
    emojis,
    initialIndex = 0, 
    onClose, 
    onDelete, 
    isMoodView = false
}: PostViewProps) {
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [emojiToDelete, setEmojiToDelete] = React.useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const animationControls = useAnimation();
  const progress = useMotionValue(0);
  const storyTimer = useRef<NodeJS.Timeout>();

  const currentEmojiState = emojis[currentIndex];
  
  const goToNext = () => {
    if (currentIndex < emojis.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else {
        onClose(); // Close if it's the last one
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (isMoodView) {
      progress.set(0);
      animationControls.stop();
      animationControls.set({ width: '0%' });
      
      animationControls.start({
          width: '100%',
          transition: { duration: 10, ease: 'linear' }
      }).then(({width}) => {
         // Check if animation completed fully before going to next
         if (width === '100%') {
            goToNext();
         }
      });
    }
    return () => {
      animationControls.stop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isMoodView, animationControls]);


  // Regular Post view scrolling logic
  useEffect(() => {
    if (isMoodView) return;

    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.offsetHeight * currentIndex, behavior: 'smooth' });
    }
  }, [currentIndex, isMoodView]);


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
      setCurrentIndex(0);
    } else if (emojis.length === 0) {
      onClose();
      return null;
    }
    return null;
  }
  
  const postAuthor = currentEmojiState.user;
  let finalEmoji: EmojiState = { ...currentEmojiState };
  if (finalEmoji.model === 'loki' && finalEmoji.shape === 'blob') {
    finalEmoji.shape = 'default';
  }

  featureOffsetX.set(finalEmoji.feature_offset_x || 0);
  featureOffsetY.set(finalEmoji.feature_offset_y || 0);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: '0%',
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const renderEmojiFace = (emoji: EmojiState) => {
    const Component = emoji.model === 'loki' ? ClockFace : Face;
    const animationType = isMoodView ? 'random' : emoji.animation_type;
    return (
      <Component 
        {...emoji}
        animation_type={animationType}
        color={emoji.emoji_color}
        isDragging={false}
        isInteractive={false}
        feature_offset_x={featureOffsetX}
        feature_offset_y={featureOffsetY}
        setColor={() => {}}
      />
    );
  };
  
  // MOOD / STORY VIEW
  if (isMoodView) {
      return (
        <motion.div 
            className="h-full w-full flex flex-col bg-black relative"
            onPanEnd={(_, info) => {
                if (info.offset.y > 100) onClose();
            }}
        >
            <div className="absolute top-0 left-0 right-0 p-3 z-20">
                <div className="flex items-center gap-2">
                    {emojis.map((_, index) => (
                        <div key={index} className="w-full bg-gray-500/50 rounded-full h-1">
                            <motion.div 
                                className="bg-white h-1 rounded-full"
                                initial={{ width: '0%' }}
                                animate={index === currentIndex ? animationControls : { width: index < currentIndex ? '100%' : '0%' }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex items-center mt-3 gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={postAuthor?.picture} alt={postAuthor?.name} data-ai-hint="profile picture" />
                      <AvatarFallback>{postAuthor?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm text-white">{postAuthor?.name}</span>
                     <button onClick={onClose} className="ml-auto text-white">
                        <X size={24} />
                    </button>
                </div>
            </div>

             <div className="absolute inset-0 z-10 flex">
                <div className="flex-1" onClick={goToPrev}></div>
                <div className="flex-1" onClick={goToNext}></div>
            </div>

            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                     className="w-full h-full flex items-center justify-center absolute"
                     style={{ 
                      backgroundColor: finalEmoji.background_color,
                      filter: finalEmoji.selected_filter && finalEmoji.selected_filter !== 'None' ? `${finalEmoji.selected_filter.toLowerCase().replace('-', '')}(1)` : 'none',
                    }}
                >
                  {renderEmojiFace(finalEmoji)}
                </motion.div>
            </AnimatePresence>
        </motion.div>
      )
  }

  // REGULAR POST VIEW
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
        {emojis.map((emoji) => (
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
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={emoji.user?.picture || "https://placehold.co/64x64.png"} alt={emoji.user?.name} data-ai-hint="profile picture" />
                  <AvatarFallback>{emoji.user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <span className="ml-3 font-semibold text-sm">{emoji.user?.name || 'User'}</span>
                {user && emoji.user && user.id === emoji.user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                       <Link href={`/design?emojiId=${emoji.id}`} className="flex items-center w-full">
                         <Edit className="mr-2 h-4 w-4" />
                         <span>Edit</span>
                       </Link>
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteClick(emoji.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleSetMood(emoji.id)}>
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
                  backgroundColor: emoji.background_color,
                  filter: emoji.selected_filter && emoji.selected_filter !== 'None' ? `${emoji.selected_filter.toLowerCase().replace('-', '')}(1)` : 'none',
                }}
              >
                {renderEmojiFace(emoji)}
              </div>

              <div 
                className="px-4 pt-2 pb-4"
              >
                  <div className="flex items-center gap-4">
                    <Heart className="h-6 w-6 cursor-pointer" />
                    <MessageCircle className="h-6 w-6 cursor-pointer" />
                    <Send className="h-6 w-6 cursor-pointer" />
                    <Bookmark className="h-6 w-6 cursor-pointer ml-auto" />
                  </div>
                  <p className="text-sm font-semibold mt-2">1,234 likes</p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">{emoji.user?.name || 'User'}</span>
                    {' '}My new creation!
                  </p>
              </div>
            </motion.div>
          ))}
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
