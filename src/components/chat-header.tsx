
'use client';

import { Menu, BadgeCheck, CreditCard, Home, User, LogOut, LogIn, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { Button, buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';
import { usePlan } from '@/context/PlanContext';
import { useAuth } from '@/context/AuthContext';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


const EdengramLogo = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 100 100" 
        className={cn("h-8 w-8", className)}
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#8A2BE2', stopOpacity:1}} />
                <stop offset="50%" style={{stopColor: '#FF1493', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#00BFFF', stopOpacity:1}} />
            </linearGradient>
        </defs>
        <path 
            d="M 20 20 L 80 20 L 80 80 L 20 80 Z" 
            stroke="url(#grad1)" 
            strokeWidth="8"
            fill="none"
        />
         <path 
            d="M 35 35 L 65 35 L 65 65 L 35 65 Z" 
            stroke="url(#grad1)" 
            strokeWidth="6"
            fill="none"
        />
    </svg>
  );
  

export function ChatHeader({ children }: { children?: React.ReactNode }) {
  const { plan } = usePlan();
  const { user } = useAuth();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <EdengramLogo />
        <h1 className="text-xl font-logo font-normal -mb-1">Edengram</h1>
        {plan === 'Silver' && (
            <BadgeCheck className="h-4 w-4 text-zinc-400" />
        )}
        {plan === 'Gold' && (
            <BadgeCheck className="h-4 w-4 text-amber-400" />
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-transparent hover:text-primary">
                    <Menu />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm flex flex-col">
                <SheetHeader className="text-left">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex-1">
                    {user && (
                        <>
                            <div className="flex items-center gap-3 my-4">
                                <Avatar>
                                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{user.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <Separator/>
                        </>
                    )}
                    <nav className="flex flex-col gap-2 mt-4">
                        <SheetClose asChild>
                            <Link href="/plan" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "justify-start")}>
                                <CreditCard className="mr-3 h-5 w-5" />
                                <span>Plan</span>
                            </Link>
                        </SheetClose>
                    </nav>
                </div>

                <div className="mt-auto">
                    <Separator className="my-4" />
                    {user ? (
                         <Button variant="ghost" className="w-full justify-start text-base" onClick={handleSignOut}>
                            <LogOut className="mr-3 h-5 w-5" />
                            <span>Log out</span>
                         </Button>
                    ) : (
                        <Button variant="ghost" className="w-full justify-start text-base" onClick={handleSignIn}>
                            <LogIn className="mr-3 h-5 w-5" />
                            <span>Sign In</span>
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
