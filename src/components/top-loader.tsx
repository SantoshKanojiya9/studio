
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
    NProgress.done(); // Ensure the progress bar is finished on initial load or route change

    // The return function (cleanup) is called when the component unmounts,
    // which is the ideal time to start the progress bar for the next page.
    return () => {
      NProgress.start();
    };
  }, [pathname, searchParams]);

  return null;
}
