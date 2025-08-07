
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { likePost, unlikePost } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const BtsHandIcon = ({ isLiked, ...props }: React.SVGProps<SVGSVGElement> & { isLiked: boolean }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95", props.className)}
      {...props}
    >
      <path
        d="M9.8286 10.1718C9.8286 10.1718 9.3286 13.1718 10.8286 14.6718C12.3286 16.1718 15.3286 15.6718 15.3286 15.6718"
        stroke={isLiked ? 'hsl(var(--primary))' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.82843 3.82843C9.39073 3.26613 10.3341 3.24072 11.1718 3.24072C11.6685 3.24072 12.0673 3.32622 12.5543 3.51342C13.2193 3.76642 14.3286 4.67184 14.3286 4.67184C14.3286 4.67184 14.8286 4.17184 15.3286 4.67184C15.8286 5.17184 15.3286 6.17184 15.3286 6.17184C15.3286 6.17184 16.3286 5.67184 16.8286 6.17184C17.3286 6.67184 16.8286 7.67184 16.8286 7.67184V10.1718C16.8286 10.1718 17.3286 10.6718 16.8286 11.1718C16.3286 11.6718 15.3286 11.1718 15.3286 11.1718"
        stroke={isLiked ? 'hsl(var(--primary))' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.0002 21.0002C12.0002 21.0002 8.50016 21.0002 7.00016 19.5002C5.50016 18.0002 7.00016 14.5002 7.00016 14.5002C7.00016 14.5002 9.00016 14.5002 10.3286 14.6718"
        stroke={isLiked ? 'hsl(var(--primary))' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
);

const AnimatedHeart = ({ delay, gradientId, colors }: { delay: number, gradientId: string, colors: [string, string] }) => (
    <motion.svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      initial={{ y: 0, x: 0, scale: 0, opacity: 1 }}
      animate={{
        y: -100,
        x: Math.random() * 80 - 40,
        scale: [0.5, 1, 1.2, 1],
        opacity: 0,
        rotate: Math.random() * 90 - 45,
      }}
      transition={{ duration: 1.2, ease: "easeOut", delay }}
      className="absolute"
      style={{ willChange: 'transform, opacity' }}
    >
        <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors[0]} />
                <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
        </defs>
      <path
        fill={`url(#${gradientId})`}
        stroke={`url(#${gradientId})`}
        strokeWidth="1"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </motion.svg>
);
  
export const LikeButton = ({
  postId,
  initialLikes,
  isInitiallyLiked,
}: {
  postId: string;
  initialLikes: number;
  isInitiallyLiked: boolean;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    setIsLiked(isInitiallyLiked);
    setLikeCount(initialLikes);
  }, [isInitiallyLiked, initialLikes]);
  
  useEffect(() => {
    if (showHearts) {
      const timer = setTimeout(() => setShowHearts(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [showHearts]);

  const handleClick = async (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to like posts.",
        variant: "destructive",
      });
      return;
    }

    // Optimistic UI updates
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    if (!wasLiked) {
        setShowHearts(true);
    }

    try {
      if (wasLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (error) {
      // Revert UI on error
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      toast({
        title: "Something went wrong",
        description: "Could not update like status. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <BtsHandIcon isLiked={isLiked} onClick={handleClick} />
      <AnimatePresence>
        {showHearts && (
            <>
              <AnimatedHeart delay={0} gradientId="grad1" colors={['#FF0000', '#FFFF00']} />
              <AnimatedHeart delay={0.1} gradientId="grad2" colors={['#FFFF00', '#8A2BE2']} />
            </>
        )}
      </AnimatePresence>
    </div>
  );
};
