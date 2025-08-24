'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export function AutoAds() {
  const pathname = usePathname();

  const publicPages = [
    '/',
    '/about',
    '/blogs',
    '/contact',
    '/privacy',
    '/terms',
  ];

  if (!publicPages.includes(pathname)) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2882939249270622"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
