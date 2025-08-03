
'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { CredentialResponse } from 'google-one-tap';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

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
  const { user, setUser } = useAuth();
  const signInDiv = useRef<HTMLDivElement>(null);

  const handleSignIn = async (response: CredentialResponse) => {
    if (!response.credential) {
      console.error("No credential returned from Google");
      return;
    }
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });

    if (error) {
      console.error('Error signing in with Supabase', error);
      return;
    }

    if (data.user) {
      const userProfile = {
        id: data.user.id,
        name: data.user.user_metadata.name,
        email: data.user.email!,
        picture: data.user.user_metadata.picture,
      };
      
      // Upsert the user profile into the 'users' table
      const { error: upsertError } = await supabase.from('users').upsert(userProfile);

      if (upsertError) {
        console.error('Error upserting user profile', upsertError);
        // Optionally sign out the user if the profile can't be saved
        await supabase.auth.signOut();
        return;
      }
      
      // The onAuthStateChange listener in useAuth will handle setting the user state
      router.push('/mood');
    }
  };
  
  useEffect(() => {
    if (user) {
        router.push('/mood');
        return;
    }
    
    if (window.google && signInDiv.current) {
        window.google.accounts.id.initialize({
            client_id: '921829623696-p08b2g0c2kp2dbf2i6odk05gmk5u45up.apps.googleusercontent.com',
            callback: handleSignIn
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
        delayChildren: 0.5,
        staggerChildren: 0.2,
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
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <motion.div 
        className="flex flex-col items-center justify-center gap-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex items-center justify-center gap-2">
          <EdengramLogo className="h-16 w-16" />
        </div>
        <motion.h1 
            className="text-5xl font-logo font-normal"
            variants={itemVariants}
          >
            Edengram
          </motion.h1>

        <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4">
            <div ref={signInDiv}></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
