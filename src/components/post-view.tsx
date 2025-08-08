
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MoreHorizontal, Edit, Trash2, Send, Smile, X, Eye, Loader2 } from 'lucide-react';
import { motion, useMotionValue, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { setMood, removeMood, recordMoodView, getMoodViewers, getIsLiked, getLikeCount } from '@/app/actions';
import { LikeButton } from './like-button';
import { LikerListSheet } from './liker-list-sheet';

interface Mood extends EmojiState {
    mood_id: number;
    mood_user_id: string;
    is_viewed?: boolean;
    mood_user?: {
      id: string;
      name: string;
      picture: string;
  }
}

interface Viewer {
  id: string;
  name: string;
  picture: string;
}

interface PostViewEmoji extends EmojiState {
    like_count?: number;
    is_liked?: boolean;
}

interface PostViewProps {
  emojis: (PostViewEmoji | Mood)[];
  initialIndex?: number;
  onClose: (emojis?: any[]) => void;
  onDelete?: (id: string) => void;
  isMoodView?: boolean;
}


const PostContent = ({ 
    emoji, 
    onDelete,
    onSetMood
}: { 
    emoji: PostViewEmoji,
    onDelete: (id: string) => void,
    onSetMood: (id: string) => void,
}) => {
    const { user } = useAuth();
    const [localLikeCount, setLocalLikeCount] = useState(emoji.like_count ?? 0);
    const [showLikers, setShowLikers] = useState(false);
    const featureOffsetX = useMotionValue(emoji.feature_offset_x || 0);
    const featureOffsetY = useMotionValue(emoji.feature_offset_y || 0);

    const renderEmojiFace = (emoji: EmojiState) => {
        const Component = emoji.model === 'loki' ? ClockFace : Face;
        return (
          <Component 
            {...emoji}
            animation_type={emoji.animation_type}
            color={emoji.emoji_color}
            isDragging={false}
            isInteractive={false}
            feature_offset_x={featureOffsetX}
            feature_offset_y={featureOffsetY}
            setColor={() => {}}
          />
        );
    };

    return (
        <motion.div
            className="w-full h-full flex-shrink-0 flex flex-col snap-center"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex items-center px-4 py-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={emoji.user?.picture || "https://placehold.co/64x64.png"} alt={emoji.user?.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{emoji.user?.name ? emoji.user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <span className="ml-3 font-semibold text-sm">{emoji.user?.name || 'User'}</span>
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSetMood(emoji.id)}>
                                <Smile className="mr-2 h-4 w-4" />
                                <span>Set as Mood</span>
                            </DropdownMenuItem>
                            {user && emoji.user && user.id === emoji.user.id && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/design?emojiId=${emoji.id}`} className="flex items-center w-full">
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    {onDelete && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDelete(emoji.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </>
                            )}
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

            <div className="px-4 pt-3 pb-4">
                <div className="flex items-center gap-4">
                    <LikeButton 
                        postId={emoji.id} 
                        initialLikes={emoji.like_count ?? 0} 
                        isInitiallyLiked={emoji.is_liked ?? false} 
                        onLikeCountChange={setLocalLikeCount}
                    />
                    <Send className="h-6 w-6 cursor-pointer" onClick={() => onSetMood(emoji.id)} />
                </div>
                {localLikeCount > 0 && (
                    <button className="text-sm font-semibold mt-2" onClick={() => setShowLikers(true)}>
                        {localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}
                    </button>
                )}
                <p className="text-sm mt-1">
                    <span className="font-semibold">{emoji.user?.name || 'User'}</span>
                    {' '}My new creation!
                </p>
            </div>
             <LikerListSheet open={showLikers} onOpenChange={setShowLikers} emojiId={emoji.id} />
        </motion.div>
    );
};


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
  const [emojiToSetMood, setEmojiToSetMood] = useState<string | null>(null);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isViewersSheetOpen, setIsViewersSheetOpen] = useState(false);
  const [isFetchingViewers, setIsFetchingViewers] = useState(false);
  const [localEmojis, setLocalEmojis] = useState<(PostViewEmoji | Mood)[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const animationControls = useAnimation();
  
  useEffect(() => {
    const fetchLikeData = async () => {
        const emojisWithLikes = await Promise.all(
            emojis.map(async (emoji) => {
                if ('mood_id' in emoji) return emoji; // It's a mood, no need to fetch likes here.
                const [like_count, is_liked] = await Promise.all([
                    getLikeCount(emoji.id),
                    getIsLiked(emoji.id),
                ]);
                return { ...emoji, like_count, is_liked };
            })
        );
        setLocalEmojis(emojisWithLikes);
    };
    fetchLikeData();
  }, [emojis]);

  const currentEmojiState = localEmojis[currentIndex];

  const isCurrentEmojiMood = (emoji: PostViewEmoji | Mood): emoji is Mood => {
    return 'mood_id' in emoji;
  }
  
  const goToNext = useCallback(() => {
    if (currentIndex < localEmojis.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose(localEmojis);
    }
  }, [currentIndex, localEmojis, onClose]);

  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const startAnimation = useCallback(() => {
    animationControls.stop();
    animationControls.set({ width: '0%' });
    animationControls.start({
        width: '100%',
        transition: { duration: 10, ease: 'linear' }
    }).then((result) => {
        if (result && !result.cancelled) {
          goToNext();
        }
    });
  }, [animationControls, goToNext]);


  useEffect(() => {
    if (isMoodView && currentEmojiState && isCurrentEmojiMood(currentEmojiState)) {
        startAnimation();
    }
    return () => {
      animationControls.stop();
    }
  }, [currentIndex, isMoodView, currentEmojiState, startAnimation, animationControls]);


  // Regular Post view scrolling logic
  useEffect(() => {
    if (isMoodView) return;

    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        const newIndex = Math.round(container.scrollTop / container.offsetHeight);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      };
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, isMoodView]);

  useEffect(() => {
    if (isMoodView) return;
    const container = scrollContainerRef.current;
     if (container && !container.dataset.isScrolling) {
      container.scrollTo({ top: container.offsetHeight * currentIndex, behavior: 'smooth' });
    }
  },[currentIndex, isMoodView]);


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

  const handleShowViewers = async () => {
      if (!currentEmojiState || !isCurrentEmojiMood(currentEmojiState)) return;
      setIsFetchingViewers(true);
      setIsViewersSheetOpen(true);
      try {
          const fetchedViewers = await getMoodViewers(currentEmojiState.mood_id);
          setViewers(fetchedViewers);
      } catch (error) {
          console.error("Failed to fetch viewers", error);
          toast({ title: "Error", description: "Could not load viewers.", variant: "destructive" });
          setIsViewersSheetOpen(false); // Close sheet on error
      } finally {
          setIsFetchingViewers(false);
      }
  };
  
  const handleRemoveMood = async () => {
    if (!currentEmojiState || !isCurrentEmojiMood(currentEmojiState)) return;
    try {
        await removeMood();
        toast({ title: "Mood Removed", variant: 'success' });
        if (onDelete) {
            onDelete(currentEmojiState.mood_id.toString());
        }
        onClose(localEmojis);
    } catch (error: any) {
        toast({ title: "Error removing mood", description: error.message, variant: 'destructive' });
    }
  }
  
  const handleSetMoodClick = (id: string) => {
    if (user) {
        setEmojiToSetMood(id);
    }
  };

  const confirmSetMood = async () => {
    if (!emojiToSetMood) return;
    try {
        await setMood(emojiToSetMood);
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
    } finally {
        setEmojiToSetMood(null);
    }
  };

  const featureOffsetX = useMotionValue(0);
  const featureOffsetY = useMotionValue(0);
  
  if (!currentEmojiState) {
    if (emojis.length > 0 && localEmojis.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }
    onClose(localEmojis);
    return null;
  }
  
  const postAuthor = isCurrentEmojiMood(currentEmojiState) ? currentEmojiState.mood_user : currentEmojiState.user;
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
                if (info.offset.y > 100) onClose(localEmojis);
            }}
        >
            <div className="absolute top-0 left-0 right-0 p-3 z-20">
                <div className="flex items-center gap-2">
                    {localEmojis.map((_, index) => (
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
                      <AvatarFallback>{postAuthor?.name ? postAuthor.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm text-white">{postAuthor?.name}</span>
                    <div className="ml-auto flex items-center gap-2">
                        {user && currentEmojiState && isCurrentEmojiMood(currentEmojiState) && currentEmojiState.mood_user_id === user.id && (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-white"><MoreHorizontal size={24} /></button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={handleShowViewers}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>Viewers</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleRemoveMood}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Remove Mood</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <button onClick={() => onClose(localEmojis)} className="text-white">
                            <X size={24} />
                        </button>
                    </div>
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

             <Sheet open={isViewersSheetOpen} onOpenChange={setIsViewersSheetOpen}>
              <SheetContent side="bottom" className="max-h-[80%] flex flex-col">
                <SheetHeader>
                  <SheetTitle>Viewers</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  {isFetchingViewers ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : viewers.length > 0 ? (
                    <div className="flex flex-col gap-4 py-4">
                      {viewers.map((viewer) => (
                        <Link href={`/gallery?userId=${viewer.id}`} key={viewer.id} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={viewer.picture} alt={viewer.name} data-ai-hint="profile picture" />
                            <AvatarFallback>{viewer.name ? viewer.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">{viewer.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-10">
                      No viewers yet.
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
        </motion.div>
      )
  }

  // REGULAR POST VIEW
  return (
    <>
        <div className="h-full w-full flex flex-col bg-background">
        <header className="flex-shrink-0 flex h-16 items-center justify-between border-b border-border/40 bg-background px-4 z-10">
            <Button variant="ghost" size="icon" onClick={() => onClose()}>
            <ArrowLeft />
            </Button>
            <h2 className="font-semibold">{isMoodView ? "Mood" : "Posts"}</h2>
            <div className="w-10"></div> {/* Spacer */}
        </header>

        <div 
            ref={scrollContainerRef}
            className="flex-1 flex flex-col overflow-y-auto snap-y snap-mandatory no-scrollbar"
        >
            {localEmojis.map((emoji) => {
                if (isCurrentEmojiMood(emoji)) return null; // Should not happen in this view
                return (
                    <PostContent 
                        key={emoji.id} 
                        emoji={emoji} 
                        onDelete={handleDeleteClick} 
                        onSetMood={handleSetMoodClick}
                    />
                )
            })}
        </div>
        
        </div>

        <AlertDialog open={!!emojiToSetMood} onOpenChange={(isOpen) => !isOpen && setEmojiToSetMood(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Set as your Mood?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will replace your current mood. Are you sure you want to set this post as your mood?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEmojiToSetMood(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmSetMood}>
                        Yes, Set Mood
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {emojiToDelete && (
            <AlertDialog open={!!emojiToDelete} onOpenChange={(isOpen) => !isOpen && setEmojiToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Do you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setEmojiToDelete(null)}>No</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Yes, delete it</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
    </>
  );
}

    