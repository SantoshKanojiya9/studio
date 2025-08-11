
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { EmojiState } from '@/app/design/page';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import { Button } from '@/components/ui/button';
import { Lock, Grid3x3, Menu, LogOut, Share2, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getGalleryPosts, getSupportStatus, getSupporterCount, getSupportingCount, deleteUserAccount } from '@/app/actions';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryRing } from '@/components/story-ring';
import { UserListSheet } from '@/components/user-list-sheet';
import { useSupport } from '@/hooks/use-support';

const PostView = dynamic(() => 
  import('@/components/post-view').then(mod => mod.PostView),
  {
    loading: () => <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>,
    ssr: false 
  }
);


interface ProfileUser {
    id: string;
    name: string;
    picture: string;
    is_private: boolean;
    has_mood: boolean;
}

interface GalleryEmoji extends EmojiState {
    like_count: number;
    is_liked: boolean;
}

interface Mood extends EmojiState {
  mood_id: number;
  mood_created_at: string;
  mood_user_id: string;
  is_viewed?: boolean;
  mood_user?: {
      id: string;
      name: string;
      picture: string;
  }
}

const galleryCache: {
    [userId: string]: {
        posts: GalleryEmoji[],
        page: number,
        hasMore: boolean,
        scrollPosition: number
    }
} = {};

const MemoizedThumbnail = React.memo(GalleryThumbnail);

function GalleryPageContent() {
    const { user: authUser, supabase } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = searchParams.get('userId');

    const isOwnProfile = !userId || (authUser && userId === authUser.id);
    const viewingUserId = isOwnProfile ? authUser?.id : userId;

    const [profileUser, setProfileUser] = React.useState<ProfileUser | null>(null);
    const [savedEmojis, setSavedEmojis] = useState<GalleryEmoji[]>(viewingUserId ? galleryCache[viewingUserId]?.posts || [] : []);
    const [selectedEmojiId, setSelectedEmojiId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    
    const [supporterCount, setSupporterCount] = React.useState(0);
    const [supportingCount, setSupportingCount] = React.useState(0);
    const [postCount, setPostCount] = React.useState(0);
    
    const [mood, setMood] = useState<Mood | null>(null);
    const [showMood, setShowMood] = useState(false);

    const onSupportStatusChange = useCallback((newStatus: 'approved' | 'pending' | null, oldStatus: 'approved' | 'pending' | null) => {
        // Optimistically update supporter count
        const isSupporting = newStatus === 'approved';
        const wasSupporting = oldStatus === 'approved';

        if (isSupporting && !wasSupporting) {
            setSupporterCount(c => c + 1);
        } else if (!isSupporting && wasSupporting) {
            setSupporterCount(c => Math.max(0, c - 1));
        }
    }, []);

    const [initialSupportStatus, setInitialSupportStatus] = React.useState<'approved' | 'pending' | null>(null);
    const { supportStatus, isLoading: isSupportLoading, handleSupportToggle } = useSupport(viewingUserId, initialSupportStatus, profileUser?.is_private, undefined, onSupportStatusChange);
    
    const [page, setPage] = useState(viewingUserId ? galleryCache[viewingUserId]?.page || 1 : 1);
    const [hasMore, setHasMore] = useState(viewingUserId ? galleryCache[viewingUserId]?.hasMore ?? true : true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [isInitialPostsLoading, setIsInitialPostsLoading] = useState(true);

    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);
    const [sheetContent, setSheetContent] = React.useState<'supporters' | 'supporting' | null>(null);
    
    const loaderRef = useRef(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const fetchProfileInfo = useCallback(async () => {
        if (!viewingUserId) return;
        
        setIsLoading(true);

        try {
            // Fetch user profile data
            const { data: userProfile, error: userError } = await supabase
                .from('users')
                .select('id, name, picture, is_private')
                .eq('id', viewingUserId)
                .single();

            if (userError || !userProfile) throw new Error(userError?.message || "User profile not found.");

            // Check if user has an active mood
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { data: moodData, error: moodError } = await supabase
                .from('moods')
                .select('id, created_at, emoji:emojis!inner(*, user:users!inner(id, name, picture)), views:mood_views(viewer_id)')
                .eq('user_id', viewingUserId)
                .gte('created_at', twentyFourHoursAgo)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (moodError && moodError.code !== 'PGRST116') { // Ignore no rows found error
                console.error("Error fetching mood:", moodError);
            }

            if (moodData && authUser) {
                const views = (moodData.views as unknown as { viewer_id: string }[]) || [];
                const isViewed = views.some(view => view.viewer_id === authUser.id);
                setMood({
                    ...(moodData.emoji as unknown as EmojiState),
                    mood_id: moodData.id,
                    mood_created_at: moodData.created_at,
                    mood_user_id: viewingUserId,
                    mood_user: moodData.emoji.user,
                    is_viewed: isViewed,
                });
            }

            const fullProfile: ProfileUser = { ...userProfile, has_mood: !!moodData };
            setProfileUser(fullProfile);

            const [supporters, following, postCountResult] = await Promise.all([
                getSupporterCount(viewingUserId),
                getSupportingCount(viewingUserId),
                supabase.from('emojis').select('*', { count: 'exact', head: true }).eq('user_id', viewingUserId)
            ]);

            setSupporterCount(supporters);
            setSupportingCount(following);
            setPostCount(postCountResult.count ?? 0);
            
            if (!isOwnProfile && authUser) {
                const status = await getSupportStatus(authUser.id, viewingUserId);
                setInitialSupportStatus(status);
            }
            
            const canView = !userProfile.is_private || isOwnProfile || (await getSupportStatus(authUser?.id ?? '', viewingUserId)) === 'approved';
             if (canView) {
                await fetchPosts(1, true); // This will set isInitialPostsLoading to false
            } else {
                setIsInitialPostsLoading(false);
            }

        } catch (error: any) {
            console.error("Failed to load profile info:", error);
            toast({ title: "Could not load profile", description: error.message, variant: 'destructive' });
             setIsInitialPostsLoading(false);
        } finally {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewingUserId, supabase, isOwnProfile, authUser, toast]);

    const fetchPosts = useCallback(async (pageNum: number, isInitial = false) => {
        if (!viewingUserId || isFetchingMore) return;
        
        if (isInitial) {
            setIsInitialPostsLoading(true);
        }
        setIsFetchingMore(true);

        try {
            const newPosts = await getGalleryPosts({ userId: viewingUserId, page: pageNum, limit: 9 });

            if (newPosts.length < 9) {
                setHasMore(false);
                if (galleryCache[viewingUserId]) galleryCache[viewingUserId].hasMore = false;
            }

            setSavedEmojis(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
                const updatedPosts = [...prev, ...uniqueNewPosts] as GalleryEmoji[];
                if (galleryCache[viewingUserId]) galleryCache[viewingUserId].posts = updatedPosts;
                return updatedPosts;
            });
            
            const nextPage = pageNum + 1;
            setPage(nextPage);
            if (galleryCache[viewingUserId]) galleryCache[viewingUserId].page = nextPage;

        } catch (error: any) {
            console.error("Failed to load posts:", error);
            toast({ title: "Failed to load posts", description: error.message, variant: 'destructive' });
        } finally {
            setIsFetchingMore(false);
            if (isInitial) {
                setIsInitialPostsLoading(false);
            }
        }
    }, [viewingUserId, toast, isFetchingMore]);


    useEffect(() => {
        if (!viewingUserId) {
            setIsLoading(false);
            setIsInitialPostsLoading(false);
            return;
        }

        if (!galleryCache[viewingUserId]) {
             galleryCache[viewingUserId] = {
                posts: [],
                page: 1,
                hasMore: true,
                scrollPosition: 0
            };
        }
        
        fetchProfileInfo();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewingUserId]);
    
     // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
               fetchPosts(page);
            }
        }, { root: scrollContainerRef.current, rootMargin: '400px', threshold: 0 });

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }
        
        return () => {
            if(currentLoader) {
                observer.unobserve(currentLoader);
            }
        }
    }, [fetchPosts, hasMore, isFetchingMore, isLoading, page]);

    // Save and restore scroll position
    useEffect(() => {
        const scrollable = scrollContainerRef.current;
        if (!scrollable || !viewingUserId) return;

        const handleScroll = () => {
            if (galleryCache[viewingUserId]) {
                galleryCache[viewingUserId].scrollPosition = scrollable.scrollTop;
            }
        };

        if (galleryCache[viewingUserId] && galleryCache[viewingUserId].scrollPosition > 0) {
            scrollable.scrollTop = galleryCache[viewingUserId].scrollPosition;
        }

        scrollable.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            scrollable.removeEventListener('scroll', handleScroll);
        };
    }, [viewingUserId]);


    const handleDelete = async (emojiId: string) => {
        if (!supabase || !viewingUserId) return;
        try {
            const { error } = await supabase.from('emojis').delete().eq('id', emojiId);
            if (error) throw error;

            const updatedEmojis = savedEmojis.filter(emoji => emoji.id !== emojiId);
            setSavedEmojis(updatedEmojis);
            if (galleryCache[viewingUserId]) galleryCache[viewingUserId].posts = updatedEmojis;

            setSelectedEmojiId(null);
            toast({ title: 'Post deleted', variant: 'success' })
        } catch (error: any) {
            console.error("Failed to delete emoji from Supabase", error);
            toast({ title: 'Error deleting post', description: error.message, variant: 'destructive' })
        }
    };
    
    const handleSignOut = async () => {
        setShowSignOutConfirm(false);
        if (!supabase) return;
        Object.keys(galleryCache).forEach(key => delete galleryCache[key]); // Clear all cache on sign out
        await supabase.auth.signOut();
        router.push('/');
    };
    
    const handleDeleteAccount = async () => {
        setShowDeleteConfirm(false);
        if (!authUser || !supabase) return;

        try {
            await deleteUserAccount();
            
            toast({
                title: 'Account Deleted',
                description: 'Your account has been permanently deleted.',
                variant: 'success',
            });

            await supabase.auth.signOut();
            router.push('/');
            
        } catch (error: any) {
          console.error("Failed to delete account:", error);
          toast({
            title: "Error Deleting Account",
            description: "Could not schedule your account for deletion.",
            variant: "destructive",
          });
        }
    };

    const handleShareProfile = async () => {
        if (!profileUser) return;
        const profileUrl = `${window.location.origin}/gallery?userId=${profileUser.id}`;
        const shareData = {
            title: `Check out ${profileUser.name}'s profile on Edengram!`,
            text: `See all of ${profileUser.name}'s creations on Edengram.`,
            url: profileUrl,
        };

        const copyToClipboard = () => {
            navigator.clipboard.writeText(profileUrl).then(() => {
                toast({
                    title: 'Profile link copied!',
                    description: 'The link to the profile has been copied to your clipboard.',
                    variant: 'success'
                });
            }).catch(err => {
                console.error("Could not copy text: ", err);
                toast({
                    title: 'Error',
                    description: 'Could not copy link to clipboard.',
                    variant: 'destructive'
                });
            });
        };
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err: any) {
                if (err.name !== 'AbortError' && err.name !== 'PermissionDeniedError') {
                    console.error('Share failed, falling back to copy:', err);
                    copyToClipboard();
                }
            }
        } else {
            copyToClipboard();
        }
    };
    
    const handleAvatarClick = () => {
        if (profileUser?.has_mood && mood) {
            setShowMood(true);
        }
    };
    
    const handleOnCloseMood = (updatedMoods: Mood[]) => {
        const updatedMood = updatedMoods[0];
        if (updatedMood && mood && updatedMood.mood_id === mood.mood_id) {
            setMood(updatedMood);
        }
        setShowMood(false);
    }

    const ProfileHeader = () => (
        <header className="flex h-16 items-center justify-between bg-background px-4 md:px-6">
            <div className="flex items-center gap-1 font-semibold text-lg">
                {!isOwnProfile ? (
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                ) : null }
                 {profileUser?.is_private && <Lock className="h-4 w-4" />}
                <span>{profileUser?.name || 'Profile'}</span>
            </div>
            {isOwnProfile && authUser && (
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
                           <Button variant="ghost" className="w-full justify-start" onClick={() => setShowSignOutConfirm(true)}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                           </Button>
                           <Button variant="destructive" className="w-full justify-start mt-2" onClick={() => setShowDeleteConfirm(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                           </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            )}
        </header>
    );
    
    const selectedEmojiIndex = selectedEmojiId ? savedEmojis.findIndex(e => e.id === selectedEmojiId) : -1;
    
    if (!authUser && !userId) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center text-center p-8">
                <Lock className="h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold">Please sign in</h2>
                <p className="text-muted-foreground">You need to be signed in to view your gallery.</p>
                <Button asChild className="mt-4">
                    <Link href="/">Go to Sign In</Link>
                </Button>
            </div>
        );
    }
    
    if (showMood && mood) {
        return (
            <PostView
                emojis={[mood]}
                initialIndex={0}
                onClose={handleOnCloseMood}
                isMoodView={true}
                onDelete={(deletedId) => {
                    if (mood && mood.mood_id.toString() === deletedId) {
                        setMood(null);
                        setProfileUser(prev => prev ? {...prev, has_mood: false} : null);
                    }
                    setShowMood(false);
                }}
            />
        )
    }
    
    const canViewContent = !profileUser?.is_private || supportStatus === 'approved' || isOwnProfile;
    const showLoadingScreen = isLoading || (canViewContent && isInitialPostsLoading);

    return (
        <>
            <div className="flex h-full w-full flex-col overflow-x-hidden">
            {selectedEmojiId && selectedEmojiIndex > -1 ? (
                    <PostView 
                        emojis={savedEmojis}
                        initialIndex={selectedEmojiIndex}
                        onClose={() => setSelectedEmojiId(null)}
                        onDelete={isOwnProfile ? handleDelete : undefined}
                    />
            ) : (
                <>
                    <ProfileHeader />
                    <div className="flex-1 overflow-y-auto no-scrollbar" ref={scrollContainerRef}>
                        {showLoadingScreen ? (
                            <div className="flex h-full w-full flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                        <>
                        <div className="p-4">
                             <div className="flex items-center gap-4">
                                <button onClick={handleAvatarClick} disabled={!profileUser?.has_mood}>
                                    <StoryRing hasStory={profileUser?.has_mood || false} isViewed={mood?.is_viewed}>
                                        <Avatar className="w-20 h-20">
                                            <AvatarImage src={profileUser?.picture} alt={profileUser?.name} data-ai-hint="profile picture"/>
                                            <AvatarFallback>{profileUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </StoryRing>
                                </button>
                                <div className="flex-1 flex justify-around">
                                    <div className="text-center">
                                        <p className="font-bold text-lg">{postCount}</p>
                                        <p className="text-sm text-muted-foreground">posts</p>
                                    </div>
                                    <button className="text-center" onClick={() => canViewContent && setSheetContent('supporters')}>
                                        <p className="font-bold text-lg">{supporterCount}</p>
                                        <p className="text-sm text-muted-foreground">supporters</p>
                                    </button>
                                     <button className="text-center" onClick={() => canViewContent && setSheetContent('supporting')}>
                                        <p className="font-bold text-lg">{supportingCount}</p>
                                        <p className="text-sm text-muted-foreground">supporting</p>
                                    </button>
                                </div>
                            </div>
                           <div className="mt-4 flex gap-2">
                                {isOwnProfile ? (
                                    <Button variant="secondary" className="flex-1" onClick={handleShareProfile}>Share profile</Button>
                                ) : (
                                    <>
                                        <Button 
                                            variant={supportStatus === 'approved' || supportStatus === 'pending' ? "secondary" : "default"} 
                                            className="flex-1"
                                            onClick={handleSupportToggle}
                                            disabled={isSupportLoading}
                                        >
                                            {isSupportLoading ? <Loader2 className="animate-spin"/> : (
                                                supportStatus === 'approved' ? 'Unsupport' :
                                                supportStatus === 'pending' ? 'Pending' : 'Support'
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-1">
                            {canViewContent ? (
                                savedEmojis.length > 0 ? (
                                    <>
                                        <motion.div 
                                            layout
                                            className="grid grid-cols-3 gap-1"
                                        >
                                            {savedEmojis.map(emoji => (
                                                <MemoizedThumbnail key={emoji.id} emoji={emoji} onSelect={() => setSelectedEmojiId(emoji.id)} />
                                            ))}
                                        </motion.div>
                                        {hasMore && <div ref={loaderRef} className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin"/></div>}
                                    </>
                                ) : (
                                    <div className="flex flex-col h-full items-center justify-center text-center p-8 gap-4 text-muted-foreground">
                                        <div className="border-2 border-foreground rounded-full p-4">
                                            <Grid3x3 className="h-12 w-12" />
                                        </div>
                                        <h2 className="text-2xl font-bold">No Posts Yet</h2>
                                        {isOwnProfile && <Link href="/design" className="text-primary font-semibold">Create your first post</Link>}
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col h-full items-center justify-center text-center p-8 gap-4 text-muted-foreground">
                                    <Lock className="h-12 w-12" />
                                    <h2 className="text-xl font-bold text-foreground">This Account is Private</h2>
                                    <p>Support this user to see their posts.</p>
                                </div>
                            )}
                        </div>
                        </>
                        )}
                    </div>
                </>
            )}
            </div>
            
            <UserListSheet
                open={!!sheetContent}
                onOpenChange={(isOpen) => !isOpen && setSheetContent(null)}
                type={sheetContent}
                userId={viewingUserId}
            />

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This will schedule your account and all associated data for permanent deletion in 30 minutes. You can cancel this by signing back in within that time.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Delete My Account
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                    Yes
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function GalleryPage() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <GalleryPageContent />
        </Suspense>
    );
}
