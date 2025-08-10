
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { supportUser, unsupportUser } from '@/app/actions';

type SupportStatus = 'approved' | 'pending' | null;

export function useSupport(
  targetUserId: string | undefined,
  initialSupportStatus: SupportStatus,
  isTargetUserPrivate: boolean | undefined,
  onStatusChange?: (userId: string, newStatus: SupportStatus) => void
) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [supportStatus, setSupportStatus] = useState<SupportStatus>(initialSupportStatus);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSupportStatus(initialSupportStatus);
  }, [initialSupportStatus]);

  const handleSupportToggle = useCallback(async () => {
    if (!currentUser || !targetUserId || isLoading) return;

    setIsLoading(true);

    const isCurrentlySupported = supportStatus === 'approved' || supportStatus === 'pending';

    try {
      if (isCurrentlySupported) {
        await unsupportUser(targetUserId);
        const newStatus = null;
        setSupportStatus(newStatus);
        if (onStatusChange) {
            onStatusChange(targetUserId, newStatus);
        }
      } else {
        await supportUser(targetUserId, !!isTargetUserPrivate);
        const newStatus = isTargetUserPrivate ? 'pending' : 'approved';
        setSupportStatus(newStatus);
         if (onStatusChange) {
            onStatusChange(targetUserId, newStatus);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not update support status.',
        variant: 'destructive',
      });
      // No need to revert here because we only set state after successful API call
    } finally {
      setIsLoading(false);
    }
  }, [
    currentUser,
    targetUserId,
    isLoading,
    supportStatus,
    isTargetUserPrivate,
    toast,
    onStatusChange
  ]);

  return {
    supportStatus,
    isLoading,
    handleSupportToggle,
  };
}
