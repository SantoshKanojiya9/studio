
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Image as ImageIcon, MessageSquare, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/image', label: 'Generate Image', icon: ImageIcon },
    { href: '/plan', label: 'Plan', icon: Briefcase },
  ];

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors w-28',
                  pathname.startsWith(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
        })}
      </nav>
    </footer>
  );
}
