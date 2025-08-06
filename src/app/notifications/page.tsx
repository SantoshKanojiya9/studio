
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const NotificationHeader = () => (
    <header className="flex h-16 items-center border-b border-border/40 bg-background px-4 md:px-6">
        <h1 className="text-xl font-bold">Notifications</h1>
    </header>
);

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // In the future, we would fetch notifications here.
      // For now, we just stop loading.
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  if (isLoading) {
    return (
        <div className="flex h-full w-full flex-col">
            <NotificationHeader />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <NotificationHeader />
      <div className="flex-1 overflow-y-auto">
        <div className="text-center p-8 text-muted-foreground">
            <p>No notifications yet.</p>
        </div>
      </div>
    </div>
  );
}
