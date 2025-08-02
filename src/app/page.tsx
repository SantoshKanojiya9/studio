
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const EdengramLogo = ({ className }: { className?: string }) => {
    const svgVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                duration: 0.5,
            }
        }
    };
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 1.5,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.svg 
            viewBox="0 0 100 100" 
            className={cn("h-16 w-16", className)}
            xmlns="http://www.w3.org/2000/svg"
            variants={svgVariants}
            initial="hidden"
            animate="visible"
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
                variants={pathVariants}
            />
             <motion.path 
                d="M 35 35 L 65 35 L 65 65 L 35 65 Z" 
                stroke="url(#grad1)" 
                strokeWidth="6"
                fill="none"
                variants={pathVariants}
            />
        </motion.svg>
    )
};

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 1,
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
          <motion.h1 
            className="text-5xl font-logo font-normal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Edengram
          </motion.h1>
        </div>
        <motion.div variants={itemVariants}>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105">
            <Link href="/design">
              Get Started
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
