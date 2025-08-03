
'use client';

import React from 'react';
import type { EmojiState } from '@/app/design/page';
import { GalleryThumbnail } from '@/components/gallery-thumbnail';
import { PostView } from '@/components/post-view';
import { Button } from '@/components/ui/button';
import { Lock, Grid3x3, Menu, LogOut, Share2, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
import { supabase } from '@/lib/supabaseClient';


const CrownedEggAvatar = () => {
    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
                <radialGradient id="eggGradient" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#f5f5f5" />
                    <stop offset="100%" stopColor="#e0e0e0" />
                </radialGradient>
                <linearGradient id="crownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
            </defs>

            {/* Egg Shadow */}
            <ellipse cx="50" cy="90" rx="35" ry="5" fill="rgba(0,0,0,0.1)" />
            
            {/* Egg */}
            <path 
                d="M 50,15
                   C 25,15 15,40 15,60
                   C 15,85 35,100 50,100
                   C 65,100 85,85 85,60
                   C 85,40 75,15 50,15 Z"
                fill="url(#eggGradient)"
                transform="translate(0, -10)"
            />

            {/* Crown */}
            <g transform="translate(0, -10)">
                <path 
                    d="M 25 30 L 75 30 L 70 45 L 30 45 Z"
                    fill="url(#crownGradient)"
                    stroke="#DAA520"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                <path 
                    d="M 25 30 L 35 15 L 50 25 L 65 15 L 75 30"
                    fill="url(#crownGradient)"
                    stroke="#DAA520"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                <circle cx="35" cy="18" r="3" fill="#FF4136" />
                <circle cx="50" cy="28" r="3" fill="#0074D9" />
                <circle cx="65" cy="18" r="3" fill="#2ECC40" />
            </g>
        </svg>
    );
};


export default function GalleryPage() {
    const [savedEmojis, setSavedEmojis] = React.useState<EmojiState[]>([]);
    const [selectedEmojiId, setSelectedEmojiId] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const { user, setUser } = useAuth();
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchEmojis = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            };

            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('emojis')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Supabase error in gallery:', error);
                    throw new Error(error.message);
                };
                
                // Since we are fetching only the current user's emojis, 
                // we can attach the current user object to each emoji.
                const emojisWithUser = (data || []).map(emoji => ({
                    ...emoji,
                    user: user
                }));


                setSavedEmojis(emojisWithUser as EmojiState[]);
            } catch (error: any) {
                console.error("Failed to load emojis from Supabase", error);
                toast({
                    title: "Could not load gallery",
                    description: error.message,
                    variant: 'destructive',
                })
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchEmojis();
        } else {
            setIsLoading(false);
        }
    }, [user, toast]);

    const handleDelete = async (emojiId: string) => {
        try {
            const { error } = await supabase.from('emojis').delete().eq('id', emojiId);
            if (error) throw error;

            const updatedEmojis = savedEmojis.filter(emoji => emoji.id !== emojiId);
            setSavedEmojis(updatedEmojis);
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
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            toast({ title: 'Error signing out', description: error.message, variant: 'destructive' });
        } else {
            setUser(null);
        }
    };
    
    const handleDeleteAccount = async () => {
        setShowDeleteConfirm(false);
        try {
            const { error } = await supabase.functions.invoke('delete-user');
            if (error) throw error;

            toast({
                title: "Account Deleted",
                description: "Your account and all data have been deleted.",
                variant: "success",
            });
            handleSignOut();

        } catch (error: any) {
            console.error("Failed to delete account", error);
            toast({
                title: "Error deleting account",
                description: error.message,
                variant: 'destructive'
            })
        }
    };

    const handleShareProfile = async () => {
        if (!user) return;
        const profileUrl = `${window.location.origin}/gallery?userId=${user.id}`;
        const shareData = {
            title: 'Check out my profile on Edengram!',
            text: `See all my creations on Edengram.`,
            url: profileUrl,
        };

        const copyToClipboard = () => {
            navigator.clipboard.writeText(profileUrl).then(() => {
                toast({
                    title: 'Profile link copied!',
                    description: 'The link to your profile has been copied to your clipboard.',
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
    
    if (isLoading) {
        return (
             <div className="flex h-full w-full flex-col">
                <div className="flex-1 overflow-y-auto">
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </div>
            </div>
        )
    }

    const ProfileHeader = () => (
        <header className="flex h-16 items-center justify-between bg-background px-4 md:px-6">
            <div className="flex items-center gap-1 font-semibold text-lg">
                <Lock className="h-4 w-4" />
                <span>{user?.name || 'Profile'}</span>
            </div>
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
                           <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
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
        </header>
    );
    
    const selectedEmoji = selectedEmojiId ? savedEmojis.find(e => e.id === selectedEmojiId) : null;
    
    if (!user) {
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
    
    return (
        <>
            <div className="flex h-full w-full flex-col overflow-x-hidden">
            {selectedEmoji ? (
                    <PostView 
                        emojis={savedEmojis}
                        initialIndex={savedEmojis.findIndex(e => e.id === selectedEmojiId)}
                        onClose={() => setSelectedEmojiId(null)}
                        onDelete={handleDelete}
                        onShare={() => handleShareProfile()}
                    />
            ) : (
                <>
                    <ProfileHeader />
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="p-4">
                            <div className="flex items-center gap-4">
                            <div className="w-20 h-20 flex-shrink-0">
                                    <CrownedEggAvatar />
                                </div>
                                <div className="flex-1 grid grid-cols-2 text-center">
                                    <div>
                                        <p className="font-bold text-lg">{savedEmojis.length}</p>
                                        <p className="text-sm text-muted-foreground">posts</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">0</p>
                                        <p className="text-sm text-muted-foreground">subscribers</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h2 className="font-semibold">{user?.name || 'User'}</h2>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button variant="secondary" className="flex-1">Edit profile</Button>
                                <Button variant="secondary" className="flex-1" onClick={handleShareProfile}>Share profile</Button>
                            </div>
                        </div>

                        <div className="p-1">
                            {savedEmojis.length > 0 ? (
                                <motion.div 
                                    layout
                                    className="grid grid-cols-3 gap-1"
                                >
                                    {savedEmojis.map(emoji => (
                                        <GalleryThumbnail key={emoji.id} emoji={emoji} onSelect={() => setSelectedEmojiId(emoji.id)} />
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="flex flex-col h-full items-center justify-center text-center p-8 gap-4">
                                    <div className="border-2 border-foreground rounded-full p-4">
                                        <Grid3x3 className="h-12 w-12" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Capture the moment with a friend</h2>
                                    <Link href="/design" className="text-primary font-semibold">Create your first post</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
            </div>
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Yes, delete account
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
