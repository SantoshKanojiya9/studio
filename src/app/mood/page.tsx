
'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense, useRef, memo } from 'react';
import { MoodHeader } from '@/components/mood-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Smile, Send, MoreHorizontal, Edit, RefreshCw } from 'lucide-react';
import type { EmojiState } from '@/app/design/page';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Face } from '@/components/emoji-face';
import { ClockFace } from '@/components/loki-face';
import { RimuruFace } from '@/components/rimuru-face';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { getFeedPosts, setMood, getFeedMoods, likePost } from '@/app/actions';
import { LikeButton } from '@/components/like-button';
import MoodStories from '@/components/mood-stories';
import type { Mood, PostViewEmoji } from '@/components/post-view';

const LikerListSheet = lazy(() => import('@/components/liker-list-sheet'));


const PostView = dynamic(() => 
  import('@/components/post-view').then(mod => mod.PostView),
  {
    loading: () => <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>,
    ssr: false 
  }
);

interface FeedPostType extends EmojiState {
    like_count: number;
    is_liked: boolean;
    user: EmojiState['user'] & { has_mood?: boolean };
}

// Store cache in a simple object. This will persist for the session.
const moodPageCache: {
    moods: Mood[] | null;
    feedPosts: FeedPostType[] | null;
    page: number;
    hasMore: boolean;
    scrollPosition: number;
} = {
    moods: null,
    feedPosts: null,
    page: 1,
    hasMore: true,
    scrollPosition: 0,
};

const FeedPost = memo(({ emoji, onSelect, onMoodUpdate, onSelectUserStory }: { emoji: FeedPostType; onSelect: () => void; onMoodUpdate: () => void; onSelectUserStory: (userId: string) => void; }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [showSetMoodConfirm, setShowSetMoodConfirm] = useState(false);
    const [currentLikeCount, setCurrentLikeCount] = useState(emoji.like_count);
    const [isLikedState, setIsLikedState] = useState(emoji.is_liked);
    const [showLikers, setShowLikers] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    
    const featureOffsetX = useMotionValue(emoji.feature_offset_x || 0);
    const featureOffsetY = useMotionValue(emoji.feature_offset_y || 0);
    let finalEmoji: EmojiState = { ...emoji };
    if (finalEmoji.model === 'loki' && finalEmoji.shape === 'blob') {
        finalEmoji.shape = 'default';
    }

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

    const handleSetMood = async () => {
        setShowSetMoodConfirm(false);
        try {
            await setMood(emoji.id);
            toast({
                title: "Mood Updated!",
                description: "Your new mood has been set.",
                variant: "success",
            });
            onMoodUpdate();
        } catch (error: any) {
            toast({
                title: "Error setting mood",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleLike = useCallback(async () => {
        if (!user || isLikedState) return;
        
        setIsLikedState(true);
        setCurrentLikeCount(prev => prev + 1);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
        await likePost(emoji.id);

    }, [isLikedState, user, emoji.id]);
    
    const onSendClick = () => {
        if (user) {
            setShowSetMoodConfirm(true);
        }
    }
    
    const onAvatarClick = () => {
        if (emoji.user?.has_mood && emoji.user.id) {
            onSelectUserStory(emoji.user.id);
        }
    }

    return (
        <>
            <div className="flex flex-col border-b border-border/40">
                <div className="flex items-center px-4 py-2">
                    <button onClick={onAvatarClick} disabled={!emoji.user?.has_mood} className="cursor-pointer disabled:cursor-default">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={emoji.user?.picture} alt={emoji.user?.name} data-ai-hint="profile picture"/>
                            <AvatarFallback>{emoji.user?.name ? emoji.user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                    </button>
                    <Link href={`/gallery?userId=${emoji.user?.id}`} className="ml-3 font-semibold text-sm">{emoji.user?.name}</Link>
                    {user && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => setShowSetMoodConfirm(true)}>
                            <Smile className="mr-2 h-4 w-4" />
                            <span>Set as Mood</span>
                          </DropdownMenuItem>
                          {user.id === emoji.user?.id && (
                          <DropdownMenuItem asChild>
                           <Link href={`/design?emojiId=${emoji.id}`} className="flex items-center w-full">
                             <Edit className="mr-2 h-4 w-4" />
                             <span>Edit</span>
                           </Link>
                          </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </div>
                <div 
                    className="relative aspect-square w-full"
                    style={{ 
                      backgroundColor: emoji.background_color,
                      filter: emoji.selected_filter && emoji.selected_filter !== 'None' ? `${emoji.selected_filter.toLowerCase().replace('-', '')}(1)` : 'none',
                    }}
                    onDoubleClick={handleLike}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center">
                            <motion.div className="origin-center" style={{ scale: 0.9 }} animate={{ scale: 0.9 }} transition={{ duration: 0 }}>
                                {renderEmojiFace(finalEmoji)}
                            </motion.div>
                        </div>
                    </div>
                     <AnimatePresence>
                        {showHeart && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeIn' }}
                            >
                                <motion.svg
                                    width="96"
                                    height="96"
                                    viewBox="0 0 24 24"
                                    className="text-white/90"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    />
                                </motion.svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="px-4 pt-3 pb-4">
                    <div className="flex items-center gap-4">
                        <LikeButton 
                            postId={emoji.id} 
                            initialLikes={emoji.like_count} 
                            isInitiallyLiked={emoji.is_liked}
                            onLikeCountChange={setCurrentLikeCount}
                            onIsLikedChange={setIsLikedState}
                        />
                        <Send className="h-6 w-6 cursor-pointer" onClick={onSendClick} />
                    </div>
                     {currentLikeCount > 0 && (
                        <button className="text-sm font-semibold mt-2" onClick={() => setShowLikers(true)}>
                            {currentLikeCount} {currentLikeCount === 1 ? 'like' : 'likes'}
                        </button>
                     )}
                     {emoji.caption && (
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                            <span className="font-semibold">{emoji.user?.name || 'User'}</span>
                            {' '}{emoji.caption}
                        </p>
                    )}
                </div>
            </div>

            <AlertDialog open={showSetMoodConfirm} onOpenChange={setShowSetMoodConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Set as your Mood?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will replace your current mood. Are you sure you want to set this post as your mood?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSetMood}>
                            Yes, Set Mood
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Suspense fallback={null}>
                {showLikers && <LikerListSheet open={showLikers} onOpenChange={setShowLikers} emojiId={emoji.id} />}
            </Suspense>
        </>
    );
});
FeedPost.displayName = 'FeedPost';


export default function MoodPage() {
    const { user, supabase } = useAuth();
    const { toast } = useToast();
    const [moods, setMoods] = useState<Mood[]>(moodPageCache.moods || []);
    const [feedPosts, setFeedPosts] = useState<FeedPostType[]>(moodPageCache.feedPosts || []);
    const [isLoading, setIsLoading] = useState(!moodPageCache.feedPosts);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    
    const [page, setPage] = useState(moodPageCache.page);
    const [hasMore, setHasMore] = useState(moodPageCache.hasMore);

    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [viewingStoryFromFeed, setViewingStoryFromFeed] = useState<Mood[] | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const loaderRef = useRef(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const fetchMoods = useCallback(async () => {
        if (!user) return [];
        try {
            const moodsData = await getFeedMoods();
            // Ensure moods have the properties required by the Mood type
            const formattedMoods = moodsData.map(m => ({
                ...m,
                like_count: 0,
                is_liked: false,
                mood_user: {
                    ...m.mood_user,
                    has_mood: true // Since these are moods, has_mood is true
                }
            }));
            return formattedMoods as Mood[];
        } catch (error) {
            console.error("Failed to fetch moods", error);
            return [];
        }
    }, [user]);

    const fetchPosts = useCallback(async (pageNum: number, limit = 5) => {
        if (isFetchingMore) return;
        setIsFetchingMore(true);
        try {
            const newPosts = await getFeedPosts({ page: pageNum, limit });
            
            if (newPosts.length < limit) {
                setHasMore(false);
                moodPageCache.hasMore = false;
            }

            setFeedPosts(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
                const updatedPosts = [...prev, ...uniqueNewPosts];
                moodPageCache.feedPosts = updatedPosts;
                return updatedPosts;
            });
            
            const nextPage = pageNum + 1;
            setPage(nextPage);
            moodPageCache.page = nextPage;
        } catch (error: any) {
            console.error("Failed to fetch posts:", error);
            toast({ title: "Failed to load more posts", description: error.message, variant: "destructive" });
        } finally {
            setIsFetchingMore(false);
        }
    }, [toast, isFetchingMore]);

    const loadInitialData = useCallback(async (forceRefresh = false) => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        
        const useCache = !forceRefresh && !!moodPageCache.feedPosts;
        if (useCache) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }

        try {
            const postsPromise = useCache
                ? Promise.resolve(moodPageCache.feedPosts)
                : getFeedPosts({ page: 1, limit: 5 });
            
            const moodsPromise = (useCache && moodPageCache.moods)
                ? Promise.resolve(moodPageCache.moods)
                : fetchMoods();

            const [moodsData, postsData] = await Promise.all([
                moodsPromise,
                postsPromise
            ]);
            
            setMoods(moodsData || []);
            moodPageCache.moods = moodsData;
            
            if (postsData) {
                if (forceRefresh || !moodPageCache.feedPosts) {
                    setFeedPosts(postsData);
                    setPage(2);
                    moodPageCache.page = 2;
                }
                moodPageCache.feedPosts = postsData;

                if (postsData.length < 5) {
                    setHasMore(false);
                    moodPageCache.hasMore = false;
                } else {
                    setHasMore(true);
                    moodPageCache.hasMore = true;
                }
            }
        } catch(error: any) {
            toast({ title: "Could not load your feed", description: error.message, variant: 'destructive'});
            setHasMore(false); // Stop trying to load more on error
        } finally {
            setIsLoading(false);
        }
    }, [fetchMoods, toast, user]);
    
    // Initial load from cache or server
    useEffect(() => {
        loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    
    // Save scroll position
    useEffect(() => {
        const scrollable = scrollContainerRef.current;
        if (!scrollable) return;

        const handleScroll = () => {
            moodPageCache.scrollPosition = scrollable.scrollTop;
        };

        scrollable.addEventListener('scroll', handleScroll, { passive: true });
        
        // Restore scroll position
        if (moodPageCache.scrollPosition > 0) {
            scrollable.scrollTop = moodPageCache.scrollPosition;
        }

        return () => {
            scrollable.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
               fetchPosts(page);
            }
        }, { 
            root: scrollContainerRef.current, 
            rootMargin: '400px', 
            threshold: 0 
        });

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }
        
        return () => {
            if(currentLoader) {
                observer.unobserve(currentLoader);
            }
        }
    }, [hasMore, isFetchingMore, isLoading, page, fetchPosts]);

    const handleRefresh = useCallback(async () => {
        moodPageCache.feedPosts = null; 
        moodPageCache.moods = null;
        moodPageCache.page = 1;
        moodPageCache.hasMore = true;
        setFeedPosts([]);
        setMoods([]);
        setPage(1);
        setHasMore(true);
        await loadInitialData(true);
    }, [loadInitialData]);

    const handleSelectMood = (mood: Mood) => {
        setSelectedMood(mood);
    };
    
    const handleSelectPost = useCallback((postId: string) => {
        setSelectedPostId(postId);
    }, []);

    const handleSelectUserStoryFromFeed = (userId: string) => {
        const userMoods = moods.filter(m => m.mood_user_id === userId);
        if (userMoods.length > 0) {
            setViewingStoryFromFeed(userMoods);
        }
    };

    const handleOnCloseMood = (updatedMoods?: Mood[]) => {
        if (updatedMoods) {
            setMoods(updatedMoods);
        }
        setSelectedMood(null);
        setViewingStoryFromFeed(null);
    }
    
    if (selectedMood) {
        // Find all moods from the same user to show in sequence
        const userMoods = moods.filter(m => m.mood_user_id === selectedMood.mood_user_id);
        const initialMoodIndex = userMoods.findIndex(m => m.mood_id === selectedMood.mood_id);
        return (
            <PostView 
                emojis={userMoods}
                initialIndex={initialMoodIndex}
                onClose={() => handleOnCloseMood(moods)} // pass original full list
                isMoodView={true}
                onDelete={(moodId) => {
                    setMoods(moods.filter(m => m.mood_id !== parseInt(moodId)));
                    loadInitialData();
                }}
            />
        )
    }

    if (viewingStoryFromFeed) {
         return (
            <PostView 
                emojis={viewingStoryFromFeed}
                initialIndex={0}
                onClose={() => handleOnCloseMood(moods)}
                isMoodView={true}
                onDelete={(moodId) => {
                    setMoods(moods.filter(m => m.mood_id !== parseInt(moodId)));
                    loadInitialData();
                }}
            />
        )
    }

    if (selectedPostId !== null) {
        const postIndex = feedPosts.findIndex(p => p.id === selectedPostId);
        return (
             <PostView 
                emojis={feedPosts}
                initialIndex={postIndex}
                onClose={() => setSelectedPostId(null)}
                onDelete={(deletedId) => {
                    const newPosts = feedPosts.filter(p => p.id !== deletedId);
                    setFeedPosts(newPosts);
                    moodPageCache.feedPosts = newPosts;
                }}
            />
        )
    }
  
  const renderContent = () => {
      if (isLoading && feedPosts.length === 0) {
          return (
              <div className="flex h-full w-full flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
              </div>
          );
      }
      if (feedPosts.length > 0) {
          return (
              <>
                  <div className="flex flex-col">
                      {feedPosts.map((post) => (
                          <FeedPost 
                            key={post.id} 
                            emoji={post} 
                            onSelect={() => handleSelectPost(post.id)} 
                            onMoodUpdate={handleRefresh}
                            onSelectUserStory={handleSelectUserStoryFromFeed}
                          />
                      ))}
                  </div>
                  {hasMore && (
                      <div ref={loaderRef} className="flex justify-center items-center p-4">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                  )}
              </>
          );
      }
      
      // This part only renders after loading is false and feedPosts is still empty
      return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 text-muted-foreground">
              <Smile className="h-16 w-16" />
              <h2 className="text-2xl font-bold text-foreground">Welcome to your Feed</h2>
              <p>When you follow people, their posts and moods will appear here.</p>
              <Link href="/explore" className="text-primary font-semibold">Explore users to follow</Link>
          </div>
      );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <MoodHeader>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={isLoading ? "animate-spin" : ""} />
          </Button>
      </MoodHeader>
      <div className="flex-1 overflow-y-auto no-scrollbar" ref={scrollContainerRef}>
      
        <MoodStories 
            user={user}
            moods={moods}
            isLoading={isLoading}
            onSelectMood={(index) => handleSelectMood(moods[index])}
        />
      
        <div className="flex-1">
            {renderContent()}
        </div>
      </div>
    </div>
  );
}
