
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';


export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return (
    <ProgressBar
        height="3px"
        color="#8A2BE2"
        options={{ showSpinner: false }}
        shallowRouting
      />
  );
}
