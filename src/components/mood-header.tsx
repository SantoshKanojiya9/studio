
'use client';

import { Menu, LogOut, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
  

export function MoodHeader({ children }: { children?: React.ReactNode }) {
  const { user, session, supabase } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    try {
      if (!session?.access_token) {
        throw new Error('Not authenticated.');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch');
      }
      
      toast({
        title: 'Account Deletion Initiated',
        description: 'Your account has been successfully marked for deletion.',
        variant: 'success',
      });
      await supabase.auth.signOut();
      router.push('/');

    } catch (error: any) {
      console.error("Failed to delete account:", error);
      toast({
        title: "Error Deleting Account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };


  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <EdengramLogo />
          <h1 className="text-xl font-logo font-normal -mb-1">Edengram</h1>
        </div>
        <div className="flex items-center gap-2">
          {children}
          {user && (
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
                    </div>

                    <div className="mt-auto">
                      <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                      </Button>
                      <Button variant="destructive" className="w-full justify-start mt-2" onClick={() => setShowDeleteConfirm(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                </SheetContent>
            </Sheet>
          )}
        </div>
      </header>
       <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
