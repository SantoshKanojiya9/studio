
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NotificationHeader = () => (
    <header className="flex h-16 items-center border-b border-border/40 bg-background px-4 md:px-6">
        <h1 className="text-xl font-bold">Notifications</h1>
    </header>
);

const notifications = [
    { id: 1, type: 'follow', user: 'Alice', userAvatar: 'https://placehold.co/64x64.png', time: '1h' },
    { id: 2, type: 'reaction', user: 'Bob', userAvatar: 'https://placehold.co/64x64.png', emojiPreview: 'https://placehold.co/48x48.png', time: '2h' },
    { id: 3, type: 'reaction', user: 'Charlie', userAvatar: 'https://placehold.co/64x64.png', emojiPreview: 'https://placehold.co/48x48.png', time: '5h' },
    { id: 4, type: 'follow', user: 'David', userAvatar: 'https://placehold.co/64x64.png', time: '1d' },
    { id: 5, type: 'follow', user: 'Eve', userAvatar: 'https://placehold.co/64x64.png', time: '2d' },
    { id: 6, type: 'reaction', user: 'Frank', userAvatar: 'https://placehold.co/64x64.png', emojiPreview: 'https://placehold.co/48x48.png', time: '3d' },
];

export default function NotificationsPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <NotificationHeader />
      <div className="flex-1 overflow-y-auto">
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id} className="flex items-center gap-3 p-4 border-b border-border/40 hover:bg-muted/50 cursor-pointer">
              <Avatar className="h-11 w-11">
                <AvatarImage src={notification.userAvatar} data-ai-hint="profile picture" />
                <AvatarFallback>{notification.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm">
                <span className="font-semibold">{notification.user}</span>
                {notification.type === 'follow' ? (
                  <span> 🔥 just subscribed to you!</span>
                ) : (
                  <span> 💬 reacted to your emoji.</span>
                )}
                 <span className="text-muted-foreground ml-2">{notification.time}</span>
              </div>
              {notification.type === 'reaction' && (
                <img src={notification.emojiPreview} alt="Emoji preview" className="h-12 w-12 rounded-md" data-ai-hint="emoji" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
