
'use client';

import React from 'react';

export const StoryRing = ({ hasStory, isViewed, children }: { hasStory: boolean; isViewed?: boolean; children: React.ReactNode }) => {
  if (!hasStory) {
    return <>{children}</>;
  }
  return (
    <div className={`rounded-full p-[2px] ${isViewed ? 'bg-border/50' : 'bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-400'}`}>
      <div className="bg-background rounded-full">
          {children}
      </div>
    </div>
  );
};
