
'use client';

import { Menu, BadgeCheck } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { usePlan } from '@/context/PlanContext';

const EdengramLogo = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 100 100" 
        className={cn("h-8 w-8", className)}
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#8A2BE2', stopOpacity:1}} />
                <stop offset="50%" style={{stopColor: '#FF1493', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#00BFFF', stopOpacity:1}} />
            </linearGradient>
        </defs>
        <path 
            d="M 20 20 L 80 20 L 80 80 L 20 80 Z" 
            stroke="url(#grad1)" 
            strokeWidth="8"
            fill="none"
        />
         <path 
            d="M 35 35 L 65 35 L 65 65 L 35 65 Z" 
            stroke="url(#grad1)" 
            strokeWidth="6"
            fill="none"
        />
    </svg>
  );
  

export function ChatHeader() {
  const { plan } = usePlan();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <EdengramLogo />
        <h1 className="text-xl font-logo font-normal -mb-1">Edengram</h1>
        {plan === 'Silver' && (
            <BadgeCheck className="h-5 w-5 text-zinc-400" />
        )}
        {plan === 'Gold' && (
            <BadgeCheck className="h-5 w-5 text-amber-400" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-transparent hover:text-primary">
          <Menu />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
    </header>
  );
}
