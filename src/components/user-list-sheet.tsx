
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
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getSupporters, getSupporting, getSupportStatus, supportUser, unsupportUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  picture: string;
}

interface UserListItemProps {
  itemUser: User;
  currentUser: { id: string } | null;
  onSupportChange: (userId: string, isNowSupported: boolean) => void;
}

const UserListItem = ({ itemUser, currentUser, onSupportChange }: UserListItemProps) => {
    const [isSupported, setIsSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }
        getSupportStatus(currentUser.id, itemUser.id).then(status => {
            setIsSupported(status);
            setIsLoading(false);
        });
    }, [currentUser, itemUser.id]);

    const handleSupportToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser || isLoading) return;

        setIsLoading(true);
        try {
            if (isSupported) {
                await unsupportUser(itemUser.id);
                 onSupportChange(itemUser.id, false);
                 setIsSupported(false);
            } else {
                await supportUser(itemUser.id);
                 onSupportChange(itemUser.id, true);
                 setIsSupported(true);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const isSelf = currentUser?.id === itemUser.id;

    return (
        <Link href={`/gallery?userId=${itemUser.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
            <Avatar className="h-12 w-12">
                <AvatarImage src={itemUser.picture} alt={itemUser.name} data-ai-hint="profile picture" />
                <AvatarFallback>{itemUser.name ? itemUser.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <span className="font-semibold flex-1">{itemUser.name}</span>
            {!isSelf && currentUser && (
                 <Button 
                    variant={isSupported ? 'secondary' : 'default'}
                    size="sm"
                    onClick={handleSupportToggle}
                    disabled={isLoading}
                 >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSupported ? 'Unsupport' : 'Support')}
                </Button>
            )}
        </Link>
    )
}

interface UserListSheetProps {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    type: 'supporters' | 'supporting' | null;
    userId: string | undefined;
}

export function UserListSheet({ open, onOpenChange, type, userId }: UserListSheetProps) {
    const [userList, setUserList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user: currentUser } = useAuth();
    
    // This state is to force re-renders on children when a support status changes
    // It's a bit of a hack, but simpler than a complex state management solution here
    const [supportChangeTracker, setSupportChangeTracker] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!type || !userId) {
                setUserList([]);
                return;
            };

            setIsLoading(true);
            try {
                let users;
                if (type === 'supporters') {
                    users = await getSupporters(userId);
                } else {
                    users = await getSupporting(userId);
                }
                setUserList(users);
            } catch (error) {
                console.error(`Failed to fetch ${type}:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        if (open) {
            fetchUsers();
        }
    }, [type, userId, open, supportChangeTracker]);
    
    const handleSupportChange = (changedUserId: string, isNowSupported: boolean) => {
        // If the list is the current user's "supporting" list, update it optimistically
        if (currentUser && currentUser.id === userId && type === 'supporting') {
            if (isNowSupported) {
                 // This is tricky without fetching the full user object, so we'll just refetch
                 setSupportChangeTracker(c => c + 1);
            } else {
                 setUserList(currentList => currentList.filter(u => u.id !== changedUserId));
            }
        }
    }

    const title = type === 'supporters' ? 'Supporters' : 'Supporting';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[80vh] flex flex-col">
                <SheetHeader className="text-center">
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : userList.length > 0 ? (
                        <div className="flex flex-col gap-1 p-2">
                           {userList.map(user => (
                               <UserListItem 
                                  key={user.id} 
                                  itemUser={user} 
                                  currentUser={currentUser} 
                                  onSupportChange={handleSupportChange}
                                />
                           ))}
                        </div>
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
