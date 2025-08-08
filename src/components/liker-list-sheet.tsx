
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getLikers } from '@/app/actions';

interface Liker {
  id: string;
  name: string;
  picture: string;
}

interface LikerListSheetProps {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    emojiId: string | undefined;
}

export function LikerListSheet({ open, onOpenChange, emojiId }: LikerListSheetProps) {
    const [likerList, setLikerList] = useState<Liker[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const fetchLikers = async () => {
            if (!emojiId) {
                setLikerList([]);
                return;
            };

            setIsLoading(true);
            try {
                const users = await getLikers(emojiId);
                setLikerList(users);
            } catch (error) {
                console.error(`Failed to fetch likers:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        if (open) {
            fetchLikers();
        }
    }, [emojiId, open]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[80vh] flex flex-col">
                <SheetHeader className="text-center">
                    <SheetTitle>Likes</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : likerList.length > 0 ? (
                        <div className="flex flex-col gap-1 p-2">
                           {likerList.map(user => (
                               <Link key={user.id} href={`/gallery?userId=${user.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                                   <Avatar className="h-12 w-12">
                                       <AvatarImage src={user.picture} alt={user.name} data-ai-hint="profile picture" />
                                       <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                   </Avatar>
                                   <span className="font-semibold flex-1">{user.name}</span>
                               </Link>
                           ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No likes yet.</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
