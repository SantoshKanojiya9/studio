
'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import '@/styles/nprogress.css';
import { BottomBar } from '@/components/bottom-bar';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { Inter, Kalam } from 'next/font/google'
import { AuthProvider } from '@/hooks/use-auth';
import React from 'react';
import { TopLoader } from '@/components/top-loader';
import { Loader2 } from 'lucide-react';
import { MainSidebar } from '@/components/main-sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const kalam = Kalam({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-kalam' })


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  const showNav = !isLoginPage;
  const publicPages = ['/', '/about', '/terms', '/privacy', '/blogs'];
  const isPublicPage = publicPages.includes(pathname);

  return (
    <html lang="en" className={cn("dark", inter.variable, kalam.variable)}>
      <head>
        <title>Edengram</title>
        <meta name="description" content="AI Chat and Image Generation" />
        {isPublicPage && (
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2882939249270622" crossOrigin="anonymous"></script>
        )}
      </head>
      <body className={cn("font-body antialiased bg-background overflow-x-hidden")}>
        <AuthProvider>
          <React.Suspense fallback={<TopLoader />}>
            <TopLoader />
            <div className="md:flex">
              {showNav && <MainSidebar />}
              <main className={cn(
                "relative h-screen w-full",
                showNav && "pb-14 md:pb-0"
              )}>
                {children}
              </main>
              {showNav && <BottomBar />}
            </div>
            <Toaster />
          </React.Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
