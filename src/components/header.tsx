'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/image', label: 'Image', icon: ImageIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Link href="/chat" className="flex items-center gap-2">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">Edengram</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                'text-sm font-medium px-3 py-2',
                pathname.startsWith(item.href)
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline-block">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
