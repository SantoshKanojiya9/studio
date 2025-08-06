
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


const EdengramLogo = ({ className }: { className?: string }) => {
    return (
        <svg 
            viewBox="0 0 100 100" 
            className={className || "h-16 w-16"}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#8A2BE2', stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor: '#FF1493', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor: '#00BFFF', stopOpacity:1}} />
                </linearGradient>
            </defs>
            <motion.path 
                d="M 20 20 L 80 20 L 80 80 L 20 80 Z" 
                stroke="url(#grad1)" 
                strokeWidth="8"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
             <motion.path 
                d="M 35 35 L 65 35 L 65 65 L 35 65 Z" 
                stroke="url(#grad1)" 
                strokeWidth="6"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            />
        </svg>
    )
};


export default function LoginPage() {
  const router = useRouter();
  const { user, supabase, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const signInDiv = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async (response: CredentialResponse) => {
    setLoading(true);
    if (!response.credential) {
      toast({ title: 'Google sign-in failed', description: 'No credential returned from Google.', variant: 'destructive' });
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });

    if (error) {
      setLoading(false);
      toast({ title: 'Sign-in Error', description: error.message, variant: 'destructive' });
    }
    // On success, the onAuthStateChange listener in useAuth will handle the redirect.
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: email.split('@')[0],
                picture: `https://placehold.co/64x64.png?text=${email.charAt(0).toUpperCase()}`
            }
        }
    });
    if (error) {
        toast({ title: 'Sign-up Error', description: error.message, variant: 'destructive'});
    } else {
        toast({ title: 'Check your email', description: 'A confirmation link has been sent to your email address.', variant: 'success'});
    }
    setLoading(false);
  }

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
     if (error) {
        toast({ title: 'Sign-in Error', description: error.message, variant: 'destructive'});
        setLoading(false);
    }
    // On success, the onAuthStateChange listener in useAuth will handle the redirect.
    // We don't setLoading(false) here because the redirect will unmount the component.
  }
  
  useEffect(() => {
    if (user) {
        router.push('/mood');
        return;
    }
    
    if (window.google && signInDiv.current && !loading && !authLoading) {
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
  }, [user, router, loading, authLoading]);


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

  const isPageLoading = loading || authLoading;

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
                            <Input id="email-in" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isPageLoading} />
                        </div>
                         <div className="space-y-2 text-left">
                            <Label htmlFor="password-in">Password</Label>
                            <Input id="password-in" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isPageLoading} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isPageLoading}>
                            {isPageLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                        </Button>
                    </form>
                </TabsContent>
                <TabsContent value="signup">
                    <form onSubmit={handleManualSignUp} className="space-y-4 pt-4">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email-up">Email</Label>
                            <Input id="email-up" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isPageLoading} />
                        </div>
                         <div className="space-y-2 text-left">
                            <Label htmlFor="password-up">Password</Label>
                            <Input id="password-up" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isPageLoading} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isPageLoading}>
                            {isPageLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
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
        
        <motion.div variants={itemVariants} className="flex flex-col items-center h-10">
            {isPageLoading ? <Loader2 className="animate-spin h-8 w-8" /> : <div ref={signInDiv}></div>}
        </motion.div>
      </motion.div>
    </div>
  );
}
