
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();
    
    // The `done()` call is placed in the cleanup function of the effect.
    // This ensures it runs when the component unmounts (i.e., navigation to a new page is complete).
    return () => {
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything itself
}
