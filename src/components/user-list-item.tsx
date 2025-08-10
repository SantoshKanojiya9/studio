
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supportUser, unsupportUser } from '@/app/actions';

interface User {
  id: string;
  name: string;
  picture: string;
  is_private: boolean;
  support_status: 'approved' | 'pending' | null;
}

interface UserListItemProps {
  itemUser: User;
  onSupportChange: (userId: string, newStatus: 'approved' | 'pending' | null) => void;
}

export const UserListItem = React.memo(({ itemUser, onSupportChange }: UserListItemProps) => {
    const { user: currentUser } = useAuth();
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
