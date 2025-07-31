
'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import { BottomBar } from '@/components/bottom-bar';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { Inter, Kalam } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const kalam = Kalam({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-kalam' })


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="en" className={cn("dark", inter.variable, kalam.variable)}>
      <head>
        <title>Edengram</title>
        <meta name="description" content="AI Chat and Image Generation" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Kalam:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased bg-background")}>
        <AuthProvider>
            <div className="relative flex flex-col h-screen">
              <main className={cn("flex-1 flex flex-col", !isHomePage && "pb-16")}>{children}</main>
              {!isHomePage && <BottomBar />}
            </div>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
