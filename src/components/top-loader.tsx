
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    // The `useEffect` cleanup function will run when the component unmounts,
    // which happens when navigation to a new page is complete.
    handleStart();
    return () => {
      handleStop();
    };
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything itself
}
