
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { CredentialResponse } from 'google-one-tap';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EdengramLogo } from '@/components/edengram-logo';


export default function LoginPage() {
  const router = useRouter();
  const { user, supabase, loading: authLoading, setLoading: setAuthLoading } = useAuth();
  const { toast } = useToast();
  const signInDiv = useRef<HTMLDivElement>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGoogleSignIn = async (response: CredentialResponse) => {
    setAuthLoading(true);
    if (!response.credential) {
      toast({ title: 'Google sign-in failed', description: 'No credential returned from Google.', variant: 'destructive' });
      setAuthLoading(false);
      return;
    }
    
    await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });
    // On success, the onAuthStateChange listener in useAuth will handle the redirect & loading state.
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
                name: email.split('@')[0],
                picture: `https://placehold.co/64x64.png?text=${email.charAt(0).toUpperCase()}`
            }
        }
    });
    if (error) {
        toast({ title: 'Sign-up Error', description: error.message, variant: 'destructive'});
        setAuthLoading(false);
    } else {
        toast({ title: 'Check your email', description: 'A confirmation link has been sent to your email address.', variant: 'success'});
        setAuthLoading(false);
    }
  }

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
     if (error) {
        toast({ title: 'Sign-in Error', description: error.message, variant: 'destructive'});
        setAuthLoading(false);
    }
    // On success, the onAuthStateChange listener in useAuth will handle the redirect & loading state.
  }
  
  useEffect(() => {
    if (user) {
        router.push('/mood');
        return;
    }
    
    if (isClient && window.google && signInDiv.current && !authLoading) {
        try {
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                callback: handleGoogleSignIn,
            });
            window.google.accounts.id.renderButton(
                signInDiv.current,
                { theme: "outline", size: "large", type: 'standard', text: 'signin_with' } 
            );
        } catch (error) {
            console.error("Google One Tap initialization error:", error);
            toast({ title: 'Sign-In Not Available', description: 'Could not initialize Google Sign-In.', variant: 'destructive' });
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, authLoading, isClient]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
      }
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 overflow-y-auto">
      <motion.div 
        className="flex flex-col items-center justify-center gap-6 w-full max-w-sm"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
          <EdengramLogo className="h-12 w-12" />
        </motion.div>
        <motion.h1 
            className="text-4xl font-logo font-normal"
            variants={itemVariants}
          >
            Edengram
        </motion.h1>

        <motion.div variants={itemVariants} className="w-full">
            <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                    <form onSubmit={handleManualSignIn} className="space-y-4 pt-4">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email-in">Email</Label>
                            <Input id="email-in" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={!isClient || authLoading} />
                        </div>
                         <div className="space-y-2 text-left">
                            <Label htmlFor="password-in">Password</Label>
                            <Input id="password-in" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={!isClient || authLoading} />
                        </div>
                        <Button type="submit" className="w-full" disabled={!isClient || authLoading}>
                            {isClient && authLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                        </Button>
                    </form>
                </TabsContent>
                <TabsContent value="signup">
                    <form onSubmit={handleManualSignUp} className="space-y-4 pt-4">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email-up">Email</Label>
                            <Input id="email-up" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={!isClient || authLoading} />
                        </div>
                         <div className="space-y-2 text-left">
                            <Label htmlFor="password-up">Password</Label>
                            <Input id="password-up" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={!isClient || authLoading} />
                        </div>
                        <Button type="submit" className="w-full" disabled={!isClient || authLoading}>
                            {isClient && authLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </motion.div>

        <motion.div variants={itemVariants} className="relative w-full flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="w-full flex flex-col items-center gap-2">
            {!isClient || (isClient && authLoading) ? (
                <Loader2 className="animate-spin h-8 w-8" />
            ) : (
              <>
                <div ref={signInDiv} className="flex justify-center"></div>
              </>
            )}
        </motion.div>
      </motion.div>
    </div>
  );
}
