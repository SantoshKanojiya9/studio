
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
  onUIDisplayChange?: (userId: string, newStatus: SupportStatus) => void,
  onCountChange?: (newStatus: SupportStatus, oldStatus: SupportStatus) => void,
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

    const oldStatus = supportStatus;
    const isCurrentlySupported = oldStatus === 'approved' || oldStatus === 'pending';
    const newStatus = isCurrentlySupported ? null : (isTargetUserPrivate ? 'pending' : 'approved');
    
    // Optimistic UI update
    setIsLoading(true);
    setSupportStatus(newStatus);
    if (onUIDisplayChange) onUIDisplayChange(targetUserId, newStatus);
    if (onCountChange) onCountChange(newStatus, oldStatus);

    try {
      if (isCurrentlySupported) {
        await unsupportUser(targetUserId);
      } else {
        await supportUser(targetUserId, !!isTargetUserPrivate);
      }
    } catch (error: any) {
      // Revert UI on error
      toast({
        title: 'Error',
        description: error.message || 'Could not update support status.',
        variant: 'destructive',
      });
      setSupportStatus(oldStatus);
      if (onUIDisplayChange) onUIDisplayChange(targetUserId, oldStatus);
      if (onCountChange) onCountChange(oldStatus, newStatus); // Revert the count change
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
    onUIDisplayChange,
    onCountChange
  ]);

  return {
    supportStatus,
    isLoading,
    handleSupportToggle,
  };
}
