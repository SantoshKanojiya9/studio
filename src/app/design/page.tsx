
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Expression = 'neutral' | 'happy' | 'angry';

const Face = ({ expression }: { expression: Expression }) => {
  const eyeVariants = {
    neutral: { y: 0, height: '20px' },
    happy: { y: 0, height: '10px' },
    angry: { y: 0, height: '15px' },
  };

  const mouthVariants = {
    neutral: {
      d: "M 20 50 Q 50 50 80 50", // Straight line
      strokeWidth: 8,
    },
    happy: {
      d: "M 20 55 Q 50 80 80 55", // Smile
      strokeWidth: 8,
    },
    angry: {
      d: "M 20 60 Q 50 30 80 60", // Frown
      strokeWidth: 8,
    },
  };
  
  const eyebrowVariants = {
    neutral: { rotate: 0, y: 0, opacity: 0 },
    happy: { rotate: 0, y: 0, opacity: 0 },
    angry: { rotate: 0, y: -5, opacity: 1 },
  }

  return (
    <motion.div 
      className="relative w-64 h-64"
      animate={{
        rotateY: [0, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {/* 3D Base */}
      <div className="w-full h-full rounded-full bg-yellow-400 shadow-[inset_0_-15px_20px_rgba(0,0,0,0.2),_0_10px_20px_rgba(0,0,0,0.3)]">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center relative">
          {/* Eyes */}
          <div className="flex gap-12 absolute top-20">
            {/* Left Eye */}
            <div className="relative">
               <motion.div 
                className="w-10 h-10 bg-black rounded-full"
                animate={eyeVariants[expression]}
                transition={{ duration: 0.2 }}
              >
                  <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-80" />
              </motion.div>
               <motion.div 
                className="absolute -top-4 -left-1 w-12 h-6 bg-black rounded-t-full"
                style={{transformOrigin: '50% 100%'}}
                variants={eyebrowVariants}
                animate={expression}
                transition={{ duration: 0.2 }}
              >
                  <motion.div 
                    className="absolute w-full h-full"
                    animate={{rotate: expression === 'angry' ? -15 : 0}}
                    transition={{ duration: 0.2 }}
                  />
              </motion.div>
            </div>
            {/* Right Eye */}
             <div className="relative">
               <motion.div 
                className="w-10 h-10 bg-black rounded-full"
                animate={eyeVariants[expression]}
                transition={{ duration: 0.2 }}
              >
                  <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full opacity-80" />
              </motion.div>
               <motion.div 
                className="absolute -top-4 -right-1 w-12 h-6 bg-black rounded-t-full"
                style={{transformOrigin: '50% 100%'}}
                variants={eyebrowVariants}
                animate={expression}
                transition={{ duration: 0.2 }}
              >
                  <motion.div 
                    className="absolute w-full h-full"
                    animate={{rotate: expression === 'angry' ? 15 : 0}}
                    transition={{ duration: 0.2 }}
                  />
              </motion.div>
            </div>
          </div>
           {/* Mouth */}
           <div className="absolute bottom-12">
            <svg width="100" height="40" viewBox="0 0 100 80">
                <motion.path
                    fill="transparent"
                    stroke="black"
                    strokeLinecap="round"
                    variants={mouthVariants}
                    animate={expression}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
                />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default function DesignPage() {
  const [expression, setExpression] = useState<Expression>('neutral');

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // A standard mouse click will have pressure 0.5.
    // Pressure-sensitive devices can provide a range from 0 to 1.
    if (e.pressure > 0.5) {
      setExpression('angry');
    } else {
      setExpression('happy');
    }
  };

  const handlePointerUp = () => {
    setExpression('neutral');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background touch-none overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Interactive 3D Emoji</h1>
        <p className="text-muted-foreground">Press on the emoji. A harder press makes it angry!</p>
        <p className="text-xs text-muted-foreground">(Requires a pressure-sensitive screen for best results)</p>
      </div>

      <motion.div
        className="w-64 h-64 flex items-center justify-center cursor-pointer select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} // Reset if the pointer leaves the area
        animate={{
          x: [-20, 20, -20],
          y: [10, -10, 10],
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: "easeInOut"
        }}
      >
        <AnimatePresence>
            <motion.div
              key={expression}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
                <Face expression={expression} />
            </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
