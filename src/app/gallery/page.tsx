
'use client';

import React from 'react';
import { PostView } from '@/components/post-view';
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
import { getSupportStatus, getSupporterCount, getSupportingCount, supportUser, unsupportUser, deleteUserAccount } from '@/app/actions';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryRing } from '@/components/story-ring';
import { UserListSheet } from '@/components/user-list-sheet';

interface ProfileUser {
    id: string;
    name: string;
    picture: string;
    is_private: boolean;
}

interface GalleryEmoji extends EmojiState {
    like_count: number;
    is_liked: boolean;
}

const galleryCache: Record<string, GalleryEmoji[]> = {};


function GalleryPageContent() {
    const { user: authUser, supabase } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = searchParams.get('userId');

    const isOwnProfile = !userId || (authUser && userId === authUser.id);
    const viewingUserId = isOwnProfile ? authUser?.id : userId;

    const [profileUser, setProfileUser] = React.useState<ProfileUser | null>(null);
    const [savedEmojis, setSavedEmojis] = React.useState<GalleryEmoji[]>(galleryCache[viewingUserId || ''] || []);
    const [selectedEmojiId, setSelectedEmojiId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    
    const [supportStatus, setSupportStatus] = React.useState<'approved' | 'pending' | null>(null);
    const [supporterCount, setSupporterCount] = React.useState(0);
    const [supportingCount, setSupportingCount] = React.useState(0);
    const [isSupportLoading, setIsSupportLoading] = React.useState(false);
    const [hasMood, setHasMood] = React.useState(false);
    const [postCount, setPostCount] = React.useState(0);

    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);
    const [sheetContent, setSheetContent] = React.useState<'supporters' | 'supporting' | null>(null);

    React.useEffect(() => {
        const fetchProfileData = async () => {
            if (!viewingUserId) {
                setIsLoading(false);
                return;
            };

            setIsLoading(true);
            try {
                // Fetch user profile info, counts, and mood status in parallel
                const { data: userProfile, error: userError } = await supabase
                    .from('users')
                    .select('id, name, picture, is_private')
                    .eq('id', viewingUserId)
                    .single();

                if (userError || !userProfile) throw new Error(userError?.message || "User profile not found.");
                
                setProfileUser(userProfile as ProfileUser);

                // Fetch counts and status
                const [supporters, following, status, moodResult, postCountResult] = await Promise.all([
                    getSupporterCount(viewingUserId),
                    getSupportingCount(viewingUserId),
                    !isOwnProfile && authUser ? getSupportStatus(authUser.id, viewingUserId) : Promise.resolve(null),
                    supabase.from('moods').select('*', { count: 'exact', head: true }).eq('user_id', viewingUserId).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
                    supabase.from('emojis').select('*', { count: 'exact', head: true }).eq('user_id', viewingUserId)
                ]);

                setSupporterCount(supporters);
                setSupportingCount(following);
                setSupportStatus(status);
                setHasMood((moodResult.count ?? 0) > 0);
                setPostCount(postCountResult.count ?? 0);

                const canViewContent = !userProfile.is_private || isOwnProfile || status === 'approved';

                if (canViewContent) {
                    // Fetch posts if they are not in the cache
                    if (!galleryCache[viewingUserId]) {
                        const { data: postData, error: postError } = await supabase
                            .from('emojis')
                            .select('*, user:users!inner(*)')
                            .eq('user_id', viewingUserId)
                            .order('created_at', { ascending: false });
                        
                        if (postError) throw postError;

                        // Add like info to posts
                        const postIds = postData.map(p => p.id);
                        const { data: likeCountsData, error: likeCountsError } = await supabase.rpc('get_like_counts_for_posts', { post_ids: postIds });
                        if (likeCountsError) throw likeCountsError;
                        const likeCountMap = new Map(likeCountsData?.map((l: any) => [l.emoji_id, l.like_count]) || []);

                        let userLikedSet = new Set();
                        if (authUser) {
                            const { data: userLikes, error: userLikesError } = await supabase.from('likes').select('emoji_id').eq('user_id', authUser.id).in('emoji_id', postIds);
                            if (userLikesError) throw userLikesError;
                            userLikedSet = new Set(userLikes?.map((l: any) => l.emoji_id) || []);
                        }

                        const fullPosts = postData.map(post => ({
                            ...post,
                            like_count: likeCountMap.get(post.id) || 0,
                            is_liked: userLikedSet.has(post.id),
                        }));


                        galleryCache[viewingUserId] = fullPosts as GalleryEmoji[];
                        setSavedEmojis(fullPosts as GalleryEmoji[]);
                    }
                } else {
                    setSavedEmojis([]);
                }
            } catch (error: any) {
                console.error("Failed to load profile data from Supabase", error);
                toast({ title: "Could not load profile", description: error.message, variant: 'destructive' });
                if (!isOwnProfile) router.push('/explore');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [viewingUserId, isOwnProfile, authUser, supabase, router, toast]);


    const handleDelete = async (emojiId: string) => {
        if (!supabase) return;
        try {
            const { error } = await supabase.from('emojis').delete().eq('id', emojiId);
            if (error) throw error;

            const updatedEmojis = savedEmojis.filter(emoji => emoji.id !== emojiId);
            setSavedEmojis(updatedEmojis);
            if (viewingUserId) galleryCache[viewingUserId] = updatedEmojis;

            setSelectedEmojiId(null);
            toast({
                title: 'Post deleted',
                variant: 'success'
            })
        } catch (error: any) {
            console.error("Failed to delete emoji from Supabase", error);
            toast({
                title: 'Error deleting post',
                description: error.message,
                variant: 'destructive'
            })
        }
    };
    
    const handleSignOut = async () => {
        setShowSignOutConfirm(false);
        if (!supabase) return;
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

    const handleSupportToggle = async () => {
        if (!authUser || !viewingUserId || !profileUser || isOwnProfile || isSupportLoading) return;

        setIsSupportLoading(true);

        const wasSupported = supportStatus === 'approved' || supportStatus === 'pending';
        const previousStatus = supportStatus;

        // Optimistic UI updates
        setSupportStatus(wasSupported ? null : (profileUser.is_private ? 'pending' : 'approved'));
        setSupporterCount(prev => prev + (wasSupported ? -1 : 1));

        try {
            if (wasSupported) {
                await unsupportUser(viewingUserId);
            } else {
                await supportUser(viewingUserId, profileUser.is_private);
            }
        } catch (error: any) {
            // Revert on error
            setSupportStatus(previousStatus);
            setSupporterCount(prev => prev + (wasSupported ? 1 : -1));
            console.error("Support error:", error);
            toast({
                title: "Something went wrong",
                description: error.message || "Could not update your support status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSupportLoading(false);
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
    
    const canViewContent = !profileUser?.is_private || supportStatus === 'approved' || isOwnProfile;

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
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                        <>
                        <div className="p-4">
                             <div className="flex items-center gap-4">
                                <StoryRing hasStory={hasMood}>
                                    <Avatar className="w-20 h-20 flex-shrink-0 border-2 border-background">
                                        <AvatarImage src={profileUser?.picture} alt={profileUser?.name} data-ai-hint="profile picture"/>
                                        <AvatarFallback>{profileUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                </StoryRing>
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
                                    <>
                                        <Button asChild variant="secondary" className="flex-1">
                                            <Link href="/profile/edit">Edit profile</Link>
                                        </Button>
                                        <Button variant="secondary" className="flex-1" onClick={handleShareProfile}>Share profile</Button>
                                    </>
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
                                    <motion.div 
                                        layout
                                        className="grid grid-cols-3 gap-1"
                                    >
                                        {savedEmojis.map(emoji => (
                                            <GalleryThumbnail key={emoji.id} emoji={emoji} onSelect={() => setSelectedEmojiId(emoji.id)} />
                                        ))}
                                    </motion.div>
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
        <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <GalleryPageContent />
        </React.Suspense>
    );
}
