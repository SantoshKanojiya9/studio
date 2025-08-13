
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function TopLoader() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start progress bar on navigation
    NProgress.start();
    setIsNavigating(true);

    return () => {
      // Done on component unmount or new navigation
      NProgress.done();
      setIsNavigating(false);
    };
  }, [pathname, searchParams]);
  
  // This effect ensures NProgress.done() is called when navigation is complete
  useEffect(() => {
    if (isNavigating) {
        NProgress.done();
        setIsNavigating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything itself
}
