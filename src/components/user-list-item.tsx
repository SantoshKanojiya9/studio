
'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSupport } from '@/hooks/use-support';
import { StoryRing } from './story-ring';


interface User {
  id: string;
  name: string;
  picture: string;
  is_private: boolean;
  support_status: 'approved' | 'pending' | null;
  has_mood: boolean;
}

interface UserListItemProps {
  itemUser: User;
  onSupportChange: (userId: string, newStatus: 'approved' | 'pending' | null) => void;
}

export const UserListItem = React.memo(({ itemUser, onSupportChange }: UserListItemProps) => {
    const { user: currentUser } = useAuth();
    const { supportStatus, isLoading, handleSupportToggle } = useSupport(
        itemUser.id, 
        itemUser.support_status,
        itemUser.is_private,
        onSupportChange
    );
    
    const isSelf = currentUser?.id === itemUser.id;

    return (
        <Link href={`/gallery?userId=${itemUser.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
            <StoryRing hasStory={itemUser.has_mood}>
              <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarImage src={itemUser.picture} alt={itemUser.name} data-ai-hint="profile picture" />
                  <AvatarFallback>{itemUser.name ? itemUser.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
            </StoryRing>
            <span className="font-semibold flex-1">{itemUser.name}</span>
            {!isSelf && currentUser && (
                 <Button 
                    variant={supportStatus === 'approved' || supportStatus === 'pending' ? 'secondary' : 'default'}
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSupportToggle();
                    }}
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
