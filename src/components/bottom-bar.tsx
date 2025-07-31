
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Palette, Clock, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/design', label: 'Emoji', icon: Palette },
    { href: '/gallery', label: 'Gallery', icon: LayoutGrid },
    { href: '/loki', label: 'Loki Clock', icon: Clock },
  ];

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 max-w-lg items-center justify-around">
        {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors w-20',
                  pathname === item.href // Use exact match for active state
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                <div className="h-6 w-6">
                  <Icon className="h-full w-full" />
                </div>
              </Link>
            )
        })}
      </nav>
    </footer>
  );
}
