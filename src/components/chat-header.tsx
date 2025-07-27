
'use client';

import { Menu, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const TesseractLogo = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
    >
      <path d="M5 5h14v14H5z" />
      <path d="M9 9h6v6H9z" />
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
  

interface ChatHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export function ChatHeader({ isMuted, onToggleMute }: ChatHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <TesseractLogo />
        <h1 className="text-xl font-bold">Edengram</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onToggleMute} variant="ghost" size="icon" aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
        <Button variant="ghost" size="icon">
          <Menu />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
    </header>
  );
}
