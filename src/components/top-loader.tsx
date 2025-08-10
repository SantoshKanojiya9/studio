
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // This component will be replaced with a more robust solution that uses router events
  // if this simple approach is not sufficient. For now, it just ensures NProgress
  // is stopped on navigation.

  return null; // This component doesn't render anything itself
}
