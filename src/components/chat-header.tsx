
'use client';

import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const EdengramLogo = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 100 100" 
        className={cn("h-8 w-8", className)}
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#833ab4', stopOpacity:1}} />
                <stop offset="50%" style={{stopColor: '#fd1d1d', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#fcb045', stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#a64aff', stopOpacity:1}} />
                <stop offset="50%" style={{stopColor: '#ff4b4b', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#ffa51d', stopOpacity:1}} />
            </linearGradient>
        </defs>
        <path 
            d="M 20 20 L 80 20 L 80 80 L 20 80 Z" 
            stroke="url(#grad2)" 
            strokeWidth="8"
            fill="none"
        />
         <path 
            d="M 35 35 L 65 35 L 65 65 L 35 65 Z" 
            stroke="url(#grad2)" 
            strokeWidth="6"
            fill="none"
        />
    </svg>
  );
  

export function ChatHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <EdengramLogo />
        <h1 className="text-3xl font-headline">Edengram</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-transparent hover:text-muted-foreground">
          <Menu />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
    </header>
  );
}
