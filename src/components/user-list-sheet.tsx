
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
import { getSupporters, getSupporting, supportUser, unsupportUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  picture: string;
  is_private: boolean;
  support_status: 'approved' | 'pending' | null;
}

interface UserListItemProps {
  itemUser: User;
  currentUser: { id: string } | null;
  onSupportChange: (userId: string, newStatus: 'approved' | 'pending' | null) => void;
}

const UserListItem = React.memo(({ itemUser, currentUser, onSupportChange }: UserListItemProps) => {
    const [supportStatus, setSupportStatus] = useState(itemUser.support_status);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setSupportStatus(itemUser.support_status);
    }, [itemUser.support_status]);

    const handleSupportToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser || isLoading) return;

        setIsLoading(true);
        const previousStatus = supportStatus;
        const isCurrentlySupported = supportStatus === 'approved' || supportStatus === 'pending';
        const newOptimisticStatus = isCurrentlySupported ? null : (itemUser.is_private ? 'pending' : 'approved');

        setSupportStatus(newOptimisticStatus);

        try {
            if (isCurrentlySupported) {
                await unsupportUser(itemUser.id);
                onSupportChange(itemUser.id, null);
            } else {
                await supportUser(itemUser.id, itemUser.is_private);
                onSupportChange(itemUser.id, newOptimisticStatus);
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
            setSupportStatus(previousStatus); // Revert on error
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
                    variant={supportStatus === 'approved' || supportStatus === 'pending' ? 'secondary' : 'default'}
                    size="sm"
                    onClick={handleSupportToggle}
                    disabled={isLoading}
                 >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                        (supportStatus === 'approved' ? 'Unsupport' : 
                         supportStatus === 'pending' ? 'Pending' : 'Support')}
                </Button>
            )}
        </Link>
    )
});
UserListItem.displayName = 'UserListItem';

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
    }, [type, userId, open]);
    
    const handleSupportChange = (changedUserId: string, newStatus: 'approved' | 'pending' | null) => {
        setUserList(currentList => 
            currentList.map(user => 
                user.id === changedUserId 
                ? { ...user, support_status: newStatus } 
                : user
            )
        );
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
