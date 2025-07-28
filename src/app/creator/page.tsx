
'use client';

import React, { useState } from 'react';
import { CreatorCanvas } from '@/components/creator/canvas';
import { CreatorToolbar } from '@/components/creator/toolbar';
import { ChatHeader } from '@/components/chat-header';

export type CharacterStyle = {
  backgroundColor: string;
  size: number;
  shape: 'circle' | 'square';
};

export default function CreatorPage() {
  const [characterStyle, setCharacterStyle] = useState<CharacterStyle>({
    backgroundColor: '#ffb300',
    size: 200,
    shape: 'circle',
  });

  return (
    <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-background">
            <ChatHeader />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_350px] overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-4 bg-secondary/20 h-full">
                <CreatorCanvas style={characterStyle} />
            </div>
            <div className="border-l border-border bg-background p-4 overflow-y-auto">
                <CreatorToolbar style={characterStyle} setStyle={setCharacterStyle} />
            </div>
        </div>
    </div>
  );
}
