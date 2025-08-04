
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { CredentialResponse } from 'google-one-tap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const signInDiv = useRef<HTMLDivElement>(null);
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast({ title: 'Google sign-in failed', description: 'No credential returned from Google.', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });
    setLoading(false);

    if (error) {
      toast({ title: 'Sign-in Error', description: error.message, variant: 'destructive' });
      return;
    }

    if (data.user) {
      router.push('/mood');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    let data, error;
  
    if (isLoginView) {
      ({ data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }));
    } else {
      // The useAuth hook now handles profile creation, so we can simplify this.
      ({ data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: email.split('@')[0] || `Guest-${Math.random().toString(36).substring(2, 8)}`,
            picture: `https://placehold.co/64x64.png?text=${email.charAt(0).toUpperCase()}`
          }
        }
      }));
    }
  
    setLoading(false);
  
    if (error) {
      toast({ title: isLoginView ? 'Sign-in Error' : 'Sign-up Error', description: error.message, variant: 'destructive' });
      return;
    }
  
    if (data.user) {
      if (!isLoginView && !data.session) {
        toast({ title: 'Success!', description: 'Please check your email to verify your account.', variant: 'success' });
      }
      // The useAuth hook will redirect to /mood on successful login
    }
  };
  
  useEffect(() => {
    if (user) {
        router.push('/mood');
        return;
    }
    
    if (window.google && signInDiv.current) {
        window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: handleGoogleSignIn
        });
        window.google.accounts.id.renderButton(
            signInDiv.current,
            { theme: "outline", size: "large", type: 'standard', text: 'signin_with' } 
        );
    }
  }, [user, router]);


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

        <motion.form variants={itemVariants} className="w-full flex flex-col gap-4 text-left" onSubmit={handleEmailAuth}>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isLoginView ? 'Sign In' : 'Sign Up')}
            </Button>
        </motion.form>

        <motion.div variants={itemVariants} className="text-sm">
            <Button variant="link" onClick={() => setIsLoginView(!isLoginView)}>
                {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
        </motion.div>
        
        <motion.div variants={itemVariants} className="relative w-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50"></span>
          </div>
          <span className="relative px-2 bg-background text-xs uppercase text-muted-foreground">Or continue with</span>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col items-center">
            <div ref={signInDiv}></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
