
'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';

const Face = ({ expression }: { expression: Expression }) => {
  const eyeVariants = {
    neutral: { y: 0, scaleY: 1 },
    happy: { y: 4, scaleY: 0.8 },
    angry: { y: -2, scaleY: 1 },
    sad: { y: 6, scaleY: 0.9 },
    surprised: { y: -3, scaleY: 1.1 },
  };

  const mouthVariants = {
    neutral: {
      d: "M 30 50 Q 50 50 70 50", // Straight line
    },
    happy: {
      d: "M 30 50 Q 50 70 70 50", // Smile
    },
    angry: {
      d: "M 30 60 Q 50 40 70 60", // Frown
    },
    sad: {
        d: "M 30 60 Q 50 50 70 60", // Sad mouth
    },
    surprised: {
        d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55", // Open mouth
    }
  };
  
  const eyebrowVariants = {
    neutral: { y: 0, rotate: 0 },
    happy: { y: -4, rotate: -5 },
    angry: { y: 2, rotate: 10 },
    sad: { y: 2, rotate: -10 },
    surprised: { y: -6, rotate: 5 },
  }

  const eyeLidVariants = {
      closed: { scaleY: 0, y: 5 },
      open: { scaleY: 1, y: 0 },
  }

  const blushVariants = {
    neutral: { opacity: 0, scale: 0.8 },
    happy: { opacity: 0.7, scale: 1 },
    angry: { opacity: 0, scale: 0.8 },
    sad: { opacity: 0.5, scale: 0.9 },
    surprised: { opacity: 0.4, scale: 0.9 },
  }

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const pupilX = useTransform(pointerX, [0, 1], [-8, 8]);
  const pupilY = useTransform(pointerY, [0, 1], [-6, 6]);


  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        pointerX.set(x);
        pointerY.set(y);
    }
  };

  return (
    <motion.div 
      className="relative w-80 h-64"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerX.set(0.5);
        pointerY.set(0.5);
      }}
    >
      {/* 3D Base */}
      <div className="w-full h-full rounded-[50%_50%_40%_40%/60%_60%_40%_40%] bg-orange-400 shadow-[inset_0_-20px_30px_rgba(0,0,0,0.2),_0_10px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="w-full h-full rounded-[50%_50%_40%_40%/60%_60%_40%_40%] bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 flex items-center justify-center relative">
         {/* Noise Texture Overlay */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C%2Fsvg%3E')] opacity-10"></div>
          
           {/* Cheeks */}
            <div className="flex justify-between w-56 absolute top-40">
                <motion.div 
                    className="w-12 h-6 bg-pink-400 rounded-full"
                    variants={blushVariants}
                    animate={expression}
                    transition={{ duration: 0.3 }}
                />
                <motion.div 
                    className="w-12 h-6 bg-pink-400 rounded-full"
                    variants={blushVariants}
                    animate={expression}
                    transition={{ duration: 0.3 }}
                />
            </div>
          
          {/* Eyes */}
          <div className="flex gap-20 absolute top-28">
            {/* Left Eye */}
            <motion.div className="relative" variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
              <div className="w-12 h-10 bg-fuchsia-200 rounded-full relative overflow-hidden" >
                 <motion.div 
                    className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full"
                    style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%' }}
                  >
                      <motion.div 
                        className="w-full h-full bg-black rounded-full origin-bottom"
                        animate={['open', 'closed']}
                        variants={eyeLidVariants}
                        transition={{
                            duration: 0.1,
                            repeat: Infinity,
                            repeatType: "mirror",
                            repeatDelay: 3.5,
                            ease: "easeOut"
                        }}
                      />
                  </motion.div>
              </div>
              <motion.div 
                className="absolute -top-3 left-0 w-12 h-4 bg-black"
                style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)', transformOrigin: 'center' }}
                variants={eyebrowVariants}
                animate={expression}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}
              />
            </motion.div>
            {/* Right Eye */}
             <motion.div className="relative" variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
              <div className="w-12 h-10 bg-fuchsia-200 rounded-full relative overflow-hidden">
                <motion.div 
                    className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full"
                    style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%' }}
                  >
                      <motion.div 
                        className="w-full h-full bg-black rounded-full origin-bottom"
                        animate={['open', 'closed']}
                        variants={eyeLidVariants}
                        transition={{
                            duration: 0.1,
                            repeat: Infinity,
                            repeatType: "mirror",
                            repeatDelay: 3,
                            ease: "easeOut"
                        }}
                      />
                  </motion.div>
              </div>
               <motion.div 
                className="absolute -top-3 left-0 w-12 h-4 bg-black"
                style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)', transformOrigin: 'center', transform: 'scaleX(-1)' }}
                variants={eyebrowVariants}
                animate={expression}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}
              />
            </motion.div>
          </div>
           {/* Mouth */}
           <div className="absolute bottom-12">
            <svg width="100" height="40" viewBox="0 0 100 80">
                <motion.path
                    fill="transparent"
                    stroke="black"
                    strokeWidth={5}
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
  const [isInteracting, setIsInteracting] = useState(false);
  const expressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised'];

  useEffect(() => {
    if (isInteracting) return;

    const intervalId = setInterval(() => {
        setExpression(prev => {
            const nextIndex = (expressions.indexOf(prev) + 1) % expressions.length;
            return expressions[nextIndex];
        });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isInteracting]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    // Use optional chaining for pressure to avoid errors on devices that don't support it.
    const pressure = e.pressure ?? 0;
    if (pressure > 0.5) {
      setExpression('angry');
    } else {
      setExpression('happy');
    }
  };

  const handlePointerUp = () => {
    setExpression('neutral');
    setIsInteracting(false);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background touch-none overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Interactive Emoji</h1>
        <p className="text-muted-foreground">It changes expression on its own, or you can press it!</p>
        <p className="text-xs text-muted-foreground">(Its eyes will follow you, too!)</p>
      </div>

      <motion.div
        className="w-80 h-64 flex items-center justify-center cursor-pointer select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} 
      >
        <Face expression={expression} />
      </motion.div>
    </div>
  );
}
