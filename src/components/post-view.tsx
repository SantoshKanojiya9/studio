
'use client';

import React, { useEffect, useRef, useState, useCallback, memo, lazy, Suspense } from 'react';
import type { EmojiState } from '@/app/design/page';
import { Face } from '@/components/emoji-face';
import { ClockFace } from '@/components/loki-face';
import { RimuruFace } from '@/components/rimuru-face';
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
import { ArrowLeft, MoreHorizontal, Edit, Trash2, Send, Smile, X, Eye, Loader2, Heart } from 'lucide-react';
import { motion, useMotionValue, AnimatePresence, useAnimation, animate } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { setMood, removeMood, recordMoodView, getMoodViewers, likePost } from '@/app/actions';
import { LikeButton } from './like-button';

const LikerListSheet = lazy(() => import('./liker-list-sheet'));

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
    like_count: number;
    is_liked: boolean;
    user: {
        id: string;
        name: string;
        picture: string;
    };
}

interface PostViewProps {
  emojis: (PostViewEmoji | Mood)[];
  initialIndex?: number;
  onClose: (emojis?: any[]) => void;
  onDelete?: (id: string) => void;
  isMoodView?: boolean;
}


const PostContent = memo(({ 
    emoji, 
    onDelete,
    onSetMood
}: { 
    emoji: PostViewEmoji,
    onDelete: (id: string) => void,
    onSetMood: (id: string) => void,
}) => {
    const { user } = useAuth();
    const [localLikeCount, setLocalLikeCount] = useState(emoji.like_count);
    const [isLikedState, setIsLikedState] = useState(emoji.is_liked);
    const [showLikers, setShowLikers] = useState(false);
    const [showHeart, setShowHeart] = useState(false);

    const featureOffsetX = useMotionValue(emoji.feature_offset_x || 0);
    const featureOffsetY = useMotionValue(emoji.feature_offset_y || 0);

    const renderEmojiFace = (emoji: EmojiState) => {
        const props = {
          ...emoji,
          animation_type: emoji.animation_type,
          color: emoji.emoji_color,
          isDragging: false,
          isInteractive: false,
          feature_offset_x: featureOffsetX,
          feature_offset_y: featureOffsetY,
          setColor: () => {},
        };
        switch(emoji.model) {
            case 'loki': return <ClockFace {...props} />;
            case 'rimuru': return <RimuruFace {...props} />;
            case 'emoji':
            default: return <Face {...props} />;
        }
    };

    const handleLike = useCallback(async () => {
        if (!user || isLikedState) return;
        
        // This function is just for the double-tap, so we only handle the "like" case.
        // The LikeButton component handles both liking and unliking.
        setIsLikedState(true);
        setLocalLikeCount(prev => prev + 1);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
        await likePost(emoji.id);

    }, [isLikedState, user, emoji.id]);

    return (
        <div
            className="w-full h-full flex-shrink-0 flex flex-col"
        >
            <div className="flex items-center px-4 py-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={emoji.user?.picture || "https://placehold.co/64x64.png"} alt={emoji.user?.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{emoji.user?.name ? emoji.user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <Link href={`/gallery?userId=${emoji.user?.id}`} className="ml-3 font-semibold text-sm">{emoji.user?.name || 'User'}</Link>
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
                className="flex-1 flex items-center justify-center min-h-0 relative"
                style={{ 
                    backgroundColor: emoji.background_color,
                    filter: emoji.selected_filter && emoji.selected_filter !== 'None' ? `${emoji.selected_filter.toLowerCase().replace('-', '')}(1)` : 'none',
                }}
                onDoubleClick={handleLike}
            >
                {renderEmojiFace(emoji)}
                 <AnimatePresence>
                    {showHeart && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeIn' }}
                        >
                            <Heart className="w-24 h-24 text-white/90" fill="currentColor" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-4 pt-3 pb-4">
                <div className="flex items-center gap-4">
                    <LikeButton 
                        postId={emoji.id} 
                        initialLikes={emoji.like_count ?? 0} 
                        isInitiallyLiked={emoji.is_liked ?? false} 
                        onLikeCountChange={setLocalLikeCount}
                        onIsLikedChange={setIsLikedState}
                    />
                    <Send className="h-6 w-6 cursor-pointer" onClick={() => onSetMood(emoji.id)} />
                </div>
                {localLikeCount > 0 && (
                    <button className="text-sm font-semibold mt-2" onClick={() => setShowLikers(true)}>
                        {localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}
                    </button>
                )}
                {emoji.caption && (
                    <p className="text-sm mt-1">
                        <span className="font-semibold">{emoji.user?.name || 'User'}</span>
                        {' '}{emoji.caption}
                    </p>
                )}
            </div>
            <Suspense fallback={null}>
             {showLikers && <LikerListSheet open={showLikers} onOpenChange={setShowLikers} emojiId={emoji.id} />}
            </Suspense>
        </div>
    );
});
PostContent.displayName = 'PostContent';


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
  
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const progressWidth = useMotionValue('0%');
  const animationControlsRef = useRef<ReturnType<typeof animate> | null>(null);
  
  const currentEmojiState = emojis[currentIndex];

  useEffect(() => {
    if (!currentEmojiState) {
        onClose(emojis);
    }
  }, [currentEmojiState, emojis, onClose]);

  const isCurrentEmojiMood = (emoji: PostViewEmoji | Mood): emoji is Mood => {
    return 'mood_id' in emoji;
  }
  
  const goToNext = useCallback(() => {
    if (currentIndex < emojis.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else if (!isMoodView) {
      onClose(emojis);
    }
  }, [currentIndex, emojis.length, isMoodView, onClose]);

  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const startAnimation = useCallback(() => {
    progressWidth.set('0%');
    animationControlsRef.current = animate(progressWidth, '100%', {
        duration: 10,
        ease: 'linear',
        onComplete: () => {
            const currentMood = emojis[currentIndex];
            const nextMood = emojis[currentIndex + 1];

            // Only auto-advance if the next story is from the same user
            if (isCurrentEmojiMood(currentMood) && nextMood && isCurrentEmojiMood(nextMood) && nextMood.mood_user_id === currentMood.mood_user_id) {
                goToNext();
            } else {
                // If it's the last story for this user, just stop.
                // The user will have to tap to go to the next person.
            }
        }
    });
  }, [progressWidth, currentIndex, emojis, goToNext]);


  useEffect(() => {
    if (isMoodView && currentEmojiState && isCurrentEmojiMood(currentEmojiState)) {
        if (!currentEmojiState.is_viewed) {
             recordMoodView(currentEmojiState.mood_id);
             const updatedEmojis = [...emojis];
             const mood = updatedEmojis[currentIndex] as Mood;
             mood.is_viewed = true;
        }
        startAnimation();
    }
    return () => {
      animationControlsRef.current?.stop();
    }
  }, [currentIndex, isMoodView, currentEmojiState, startAnimation, emojis]);

  useEffect(() => {
    if (isMoodView) {
        if (isViewersSheetOpen) {
            animationControlsRef.current?.pause();
        } else {
            animationControlsRef.current?.play();
        }
    }
  }, [isViewersSheetOpen, isMoodView]);


  // Effect to scroll to the initial post
  useEffect(() => {
    if (isMoodView) return;

    const container = scrollContainerRef.current;
    if (container) {
      const postElement = container.children[initialIndex] as HTMLElement;
      if (postElement) {
        container.scrollTop = postElement.offsetTop;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex, isMoodView]);


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
        onClose(emojis);
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
    return null;
  }
  
  const postAuthor = isCurrentEmojiMood(currentEmojiState) ? currentEmojiState.mood_user : (currentEmojiState as PostViewEmoji).user;
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
    const props = {
      ...emoji,
      animation_type: isMoodView ? 'random' : emoji.animation_type,
      color: emoji.emoji_color,
      isDragging: false,
      isInteractive: false,
      feature_offset_x: featureOffsetX,
      feature_offset_y: featureOffsetY,
      setColor: () => {},
    };
    switch(emoji.model) {
        case 'loki': return <ClockFace {...props} />;
        case 'rimuru': return <RimuruFace {...props} />;
        case 'emoji':
        default: return <Face {...props} />;
    }
  };
  
  // MOOD / STORY VIEW
  if (isMoodView) {
      return (
        <motion.div 
            className="h-full w-full flex flex-col bg-black relative"
            onPanEnd={(_, info) => {
                if (info.offset.y > 100) onClose(emojis);
            }}
        >
            <div className="absolute top-0 left-0 right-0 p-3 z-20">
                <div className="flex items-center gap-2">
                    {emojis.map((_, index) => (
                        <div key={index} className="w-full bg-gray-500/50 rounded-full h-1">
                            <motion.div 
                                className="bg-white h-1 rounded-full"
                                style={{ width: index === currentIndex ? progressWidth : (index < currentIndex ? '100%' : '0%') }}
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
                        <button onClick={() => onClose(emojis)} className="text-white">
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

            {finalEmoji.caption && (
              <div className="absolute bottom-4 left-4 right-4 z-20 text-center">
                  <p className="inline-block bg-black/50 text-white text-sm p-2 rounded-lg">
                      {finalEmoji.caption}
                  </p>
              </div>
            )}

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
              <Button variant="ghost" size="icon" onClick={() => onClose(emojis)}>
              <ArrowLeft />
              </Button>
              <h2 className="font-semibold">{isMoodView ? "Mood" : "Posts"}</h2>
              <div className="w-10"></div> {/* Spacer */}
          </header>

          <div 
              ref={scrollContainerRef}
              className="flex-1 flex flex-col overflow-y-auto no-scrollbar"
          >
              {emojis.map((emoji) => {
                  if (isCurrentEmojiMood(emoji)) return null; // Should not happen in this view
                  return (
                      <PostContent 
                          key={emoji.id} 
                          emoji={emoji as PostViewEmoji} 
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
    </>
  );
}



