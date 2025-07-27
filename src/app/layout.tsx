import type { Metadata } from 'next';
import './globals.css';
import { BottomBar } from '@/components/bottom-bar';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Edengram',
  description: 'AI Chat and Image Generation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased bg-background")}>
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1 flex flex-col pb-16 md:pb-0">{children}</main>
          <BottomBar />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
