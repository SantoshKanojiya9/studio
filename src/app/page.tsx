
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

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);


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

  const handleFacebookSignIn = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast({ title: 'Facebook Sign-in Error', description: error.message, variant: 'destructive' });
      setAuthLoading(false);
    }
    // On success, Supabase handles the redirect.
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: 'https://9000-firebase-ceogram-1754599515031.cluster-73qgvk7hjjadkrjeyexca5ivva.cloudworkstations.dev/auth/callback',
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
                <Button variant="outline" className="w-full" onClick={handleFacebookSignIn}>
                    <FacebookIcon className="mr-2 h-4 w-4" />
                    Continue with Facebook
                </Button>
              </>
            )}
        </motion.div>
      </motion.div>
    </div>
  );
}
