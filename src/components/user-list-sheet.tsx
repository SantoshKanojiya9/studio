
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';
import { getSupporters, getSupporting } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { UserListItem } from './user-list-item';


interface User {
  id: string;
  name: string;
  picture: string;
  is_private: boolean;
  support_status: 'approved' | 'pending' | null;
  has_mood: boolean;
}

const userListCache: {
    [key: string]: {
        items: User[],
        page: number,
        hasMore: boolean,
        scrollPosition: number
    }
} = {};

interface UserListSheetProps {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    type: 'supporters' | 'supporting' | null;
    userId: string | undefined;
}

export function UserListSheet({ open, onOpenChange, type, userId }: UserListSheetProps) {
    const { toast } = useToast();
    
    const cacheKey = `${type}-${userId}`;
    const [userList, setUserList] = useState<User[]>(userListCache[cacheKey]?.items || []);
    const [page, setPage] = useState(userListCache[cacheKey]?.page || 1);
    const [hasMore, setHasMore] = useState(userListCache[cacheKey]?.hasMore ?? true);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const loaderRef = useRef(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const fetchUsers = useCallback(async (pageNum: number) => {
        if (!type || !userId || isFetchingMore) return;

        if (pageNum === 1) setIsLoading(true);
        else setIsFetchingMore(true);

        try {
            const fetcher = type === 'supporters' ? getSupporters : getSupporting;
            const newUsers = await fetcher({ userId, page: pageNum, limit: 15 });

            if (newUsers.length < 15) {
                setHasMore(false);
                if (userListCache[cacheKey]) userListCache[cacheKey].hasMore = false;
            }

            setUserList(prev => {
                const existingIds = new Set(prev.map(u => u.id));
                const uniqueNew = newUsers.filter(u => !existingIds.has(u.id));
                const updatedList = pageNum === 1 ? newUsers : [...prev, ...uniqueNew];
                if (userListCache[cacheKey]) userListCache[cacheKey].items = updatedList as User[];
                return updatedList as User[];
            });
            
            const nextPage = pageNum + 1;
            setPage(nextPage);
            if (userListCache[cacheKey]) userListCache[cacheKey].page = nextPage;

        } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
            toast({ title: "Error loading users", variant: "destructive" });
        } finally {
            if (pageNum === 1) setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [type, userId, isFetchingMore, toast, cacheKey]);

    useEffect(() => {
        if (open && userId && type) {
            if (!userListCache[cacheKey]) {
                 userListCache[cacheKey] = {
                    items: [],
                    page: 1,
                    hasMore: true,
                    scrollPosition: 0,
                 };
                fetchUsers(1);
            } else {
                setUserList(userListCache[cacheKey].items);
                setPage(userListCache[cacheKey].page);
                setHasMore(userListCache[cacheKey].hasMore);
                 // Restore scroll position
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTop = userListCache[cacheKey].scrollPosition;
                    }
                }, 0);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, userId, type]);

    useEffect(() => {
        const scrollable = scrollContainerRef.current;
        if (!scrollable || !cacheKey) return;
    
        const handleScroll = () => {
            if (userListCache[cacheKey]) {
                userListCache[cacheKey].scrollPosition = scrollable.scrollTop;
            }
        };
    
        scrollable.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollable.removeEventListener('scroll', handleScroll);
    }, [cacheKey]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
                fetchUsers(page);
            }
        }, { root: scrollContainerRef.current, rootMargin: '200px', threshold: 0 });

        const currentLoader = loaderRef.current;
        if (currentLoader) observer.observe(currentLoader);

        return () => {
            if (currentLoader) observer.unobserve(currentLoader);
        };
    }, [fetchUsers, hasMore, isFetchingMore, isLoading, page]);

    const handleSupportChange = (changedUserId: string, newStatus: 'approved' | 'pending' | null) => {
        const updateList = (list: User[]) => list.map(user => 
            user.id === changedUserId 
            ? { ...user, support_status: newStatus } 
            : user
        );
        setUserList(updateList);
        if (userListCache[cacheKey]) {
            userListCache[cacheKey].items = updateList(userListCache[cacheKey].items);
        }
    }

    const title = type === 'supporters' ? 'Supporters' : 'Supporting';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[80vh] flex flex-col">
                <SheetHeader className="text-center">
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto no-scrollbar" ref={scrollContainerRef}>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : userList.length > 0 ? (
                        <>
                            <div className="flex flex-col gap-1 p-2">
                            {userList.map(user => (
                                <UserListItem 
                                    key={user.id} 
                                    itemUser={user} 
                                    onSupportChange={handleSupportChange}
                                />
                            ))}
                            </div>
                            {hasMore && <div ref={loaderRef} className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin"/></div>}
                        </>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No users to show.</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

    