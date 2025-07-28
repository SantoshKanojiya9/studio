
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Sparkles, Glasses, Palette, Wand2, ArrowLeft, Smile, Frown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';


type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
type MenuType = 'main' | 'colors';

const ClockFace = ({ 
    expression, 
    color, 
    pointerX,
    pointerY,
    featureOffset,
}: { 
    expression: Expression, 
    color: string, 
    pointerX: any,
    pointerY: any,
    featureOffset: { x: number, y: number },
}) => {
  const eyeVariants = {
    neutral: { y: 0, scaleY: 1, height: '2rem' },
    happy: { y: 2, scaleY: 0.9, height: '1.75rem' },
    angry: { y: -2, scaleY: 0.8, height: '1.5rem' },
    sad: { y: 4, scaleY: 0.8, height: '1.75rem' },
    surprised: { y: -3, scaleY: 1.1, height: '2.25rem' },
  };

  const mouthVariants = {
    neutral: {
      d: "M 30 50 Q 50 50 70 50", // Straight line
    },
    happy: {
      d: "M 30 50 Q 50 65 70 50", // Smile
    },
    angry: {
        d: "M 30 55 Q 50 40 70 55", // Angry
    },
    sad: {
        d: "M 30 60 Q 50 50 70 60", // Sad mouth
    },
    surprised: {
        d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55", // Open mouth
    },
  };
  
  const eyebrowVariants = {
    neutral: { y: 0, rotate: 0 },
    happy: { y: -3, rotate: -5 },
    angry: { y: 2, rotate: 5 },
    sad: { y: 1, rotate: 5 },
    surprised: { y: -5, rotate: 3 },
  }

  const blushVariants = {
    neutral: { opacity: 0, scale: 0.8 },
    happy: { opacity: 0.8, scale: 1 },
    angry: { opacity: 0.6, scale: 1.1 },
    sad: { opacity: 0.4, scale: 0.9 },
    surprised: { opacity: 0.3, scale: 1 },
  }
  
  const smoothPointerX = useSpring(pointerX, { stiffness: 300, damping: 20, mass: 0.5 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 300, damping: 20, mass: 0.5 });
  
  const pupilX = useTransform(smoothPointerX, [0, 1], [-5, 5]);
  const pupilY = useTransform(smoothPointerY, [0, 1], [-4, 4]);
  
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        pointerX.set(x);
        pointerY.set(y);
    }
  };

  const handlePointerLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };
  
  const tickMarks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const isHour = i % 3 === 0;
    return (
        <div 
            key={i} 
            className="absolute w-full h-full"
            style={{ transform: `rotate(${angle}deg)` }}
        >
            <div className={cn(
                "absolute bg-black/70",
                isHour ? "w-1 h-3 top-1.5 left-1/2 -ml-0.5" : "w-0.5 h-2 top-1.5 left-1/2 -ml-0.5"
            )}></div>
        </div>
    )
  });

  return (
    <motion.div 
      className="relative w-56 h-56"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
        {/* Arms */}
        <motion.div className="absolute top-1/2 -translate-y-1/2 -left-10 w-20 h-8 z-0"
         animate={{ rotate: expression === 'happy' ? -25 : (expression === 'angry' ? -50 : -10), x: expression === 'angry' ? -10 : 0 }}
         transition={{ type: 'spring', stiffness: 200, damping: 10}}
        >
            <div className="w-16 h-2 bg-orangered absolute top-1/2 right-0 -translate-y-1/2 rounded-l-full"></div>
            <div className="w-8 h-8 bg-white rounded-full absolute left-0 top-1/2 -translate-y-1/2 border-2 border-black/70 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-black/70 rounded-full" style={{transform: 'translateY(2px) rotate(15deg)'}}></div>
                <div className="w-2 h-0.5 bg-black/70 rounded-full" style={{transform: 'translateY(-2px) rotate(-15deg)'}}></div>
            </div>
        </motion.div>
         <motion.div className="absolute top-1/2 -translate-y-1/2 -right-10 w-20 h-8 z-0"
          animate={{ rotate: expression === 'surprised' ? 25 : (expression === 'sad' ? 40 : 10), x: expression === 'angry' ? 10 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10}}
         >
            <div className="w-16 h-2 bg-orangered absolute top-1/2 left-0 -translate-y-1/2 rounded-r-full"></div>
             <div className="w-8 h-8 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2 border-2 border-black/70 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-black/70 rounded-full" style={{transform: 'translateY(2px) rotate(-15deg)'}}></div>
                <div className="w-2 h-0.5 bg-black/70 rounded-full" style={{transform: 'translateY(-2px) rotate(15deg)'}}></div>
            </div>
        </motion.div>

        {/* Legs */}
         <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 z-0">
              <div className="flex gap-4">
                <div className="w-2.5 h-8" style={{ backgroundColor: '#4a2c0f'}}></div>
                <div className="w-2.5 h-8" style={{ backgroundColor: '#4a2c0f'}}></div>
              </div>
              <div className="flex -mt-0.5 gap-2">
                 <div className="w-8 h-4 bg-orangered rounded-t-sm border-2 border-black/70 flex items-end justify-center"><div className="w-4 h-0.5 bg-white/70 rounded-t-sm"></div></div>
                 <div className="w-8 h-4 bg-orangered rounded-t-sm border-2 border-black/70 flex items-end justify-center"><div className="w-4 h-0.5 bg-white/70 rounded-t-sm"></div></div>
              </div>
         </div>


      <motion.div 
        className="absolute w-full h-full z-10"
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div 
          className="w-full h-full rounded-full shadow-[inset_0_-10px_12px_rgba(0,0,0,0.15),_0_5px_10px_rgba(0,0,0,0.25)] relative overflow-hidden border-4 border-black/70" 
          animate={{ backgroundColor: color }}
          transition={{ duration: 0.3 }}
        >
            {tickMarks}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C/svg%3E')] opacity-5"></div>
            
             <motion.div
                className="absolute top-5 left-5 w-1/2 h-1/4 bg-white/20 rounded-full"
                style={{
                  filter: 'blur(10px)',
                  transform: 'rotate(-25deg)',
                }}
              />

                <motion.div 
                    className="flex justify-between w-40 absolute top-32"
                    animate={{ x: featureOffset.x, y: featureOffset.y }}
                    transition={{ duration: 1.5, type: 'spring' }}
                >
                    <motion.div 
                        className="w-8 h-4 bg-rose-400/80 rounded-full"
                        style={{ filter: 'blur(1.5px)'}}
                        variants={blushVariants}
                        animate={expression}
                        transition={{ duration: 0.3, type: "spring" }}
                    />
                    <motion.div 
                        className="w-8 h-4 bg-rose-400/80 rounded-full"
                         style={{ filter: 'blur(1.5px)'}}
                        variants={blushVariants}
                        animate={expression}
                        transition={{ duration: 0.3, type: "spring" }}
                    />
                </motion.div>

            {/* Nose */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black/70 rounded-full"></div>
            
            <motion.div 
                className="flex gap-12 absolute top-1/2 -translate-y-[calc(50%_+_10px)] items-end" 
                animate={{ x: featureOffset.x, y: featureOffset.y }}
                transition={{ duration: 1.5, type: 'spring' }}
            >
                {/* Left Eye */}
                <motion.div className="relative" style={{ height: '2rem' }} variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                  <div className="w-8 h-full bg-white rounded-t-full rounded-b-md relative overflow-hidden border-2 border-black/70">
                      <motion.div 
                          className="absolute top-1/2 left-1/2 w-5 h-5 bg-black rounded-full"
                          style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%' }}
                      >
                           <motion.div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
                      </motion.div>
                  </div>
                  <motion.div 
                      className="absolute -top-1.5 left-0.5 w-7 h-2.5 bg-black/80"
                      style={{ clipPath: 'path("M0,6 C6,0, 22,0, 28,6")' }}
                      variants={eyebrowVariants}
                      animate={expression}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}
                  />
                </motion.div>

                {/* Right Eye */}
                <motion.div className="relative" style={{ height: '2rem' }} variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                  <div className="w-8 h-full bg-white rounded-t-full rounded-b-md relative overflow-hidden border-2 border-black/70">
                      <motion.div 
                          className="absolute top-1/2 left-1/2 w-5 h-5 bg-black rounded-full"
                          style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%' }}
                      >
                          <motion.div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
                      </motion.div>
                  </div>
                  <motion.div 
                      className="absolute -top-1.5 left-0.5 w-7 h-2.5 bg-black/80"
                      style={{ clipPath: 'path("M0,6 C6,0, 22,0, 28,6")' }}
                      variants={eyebrowVariants}
                      animate={expression}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}
                  />
                </motion.div>
            </motion.div>

            <motion.div 
                className="absolute top-1/2 -translate-y-1/2 mt-8" 
                animate={{ x: featureOffset.x, y: featureOffset.y }}
                transition={{ duration: 1.5, type: 'spring' }}
            >
                <svg width="64" height="28" viewBox="0 0 100 80">
                    <motion.path
                        fill="transparent"
                        stroke="black"
                        strokeWidth={3}
                        strokeLinecap="round"
                        variants={mouthVariants}
                        animate={expression}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
                    />
                </svg>
            </motion.div>
            </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};


export default function LokiPage() {
  const [expression, setExpression] = useState<Expression>('neutral');
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');

  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [emojiColor, setEmojiColor] = useState('orangered');
  const [featureOffset, setFeatureOffset] = useState({ x: 0, y: 0 });
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [isAngryMode, setIsAngryMode] = useState(false);

  const defaultBackgroundColor = '#000000';
  const defaultEmojiColor = 'orangered';
  const angryColor = 'red';

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  
  const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised'];
  
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
    
    if (!isAngryMode) {
      animationIntervalRef.current = setInterval(() => {
        const randomExpressionIndex = Math.floor(Math.random() * allExpressions.length);
        const newExpression = allExpressions[randomExpressionIndex];
        setExpression(newExpression);

        const newX = Math.random() * 20 - 10;
        const newY = Math.random() * 20 - 10;
        setFeatureOffset({ x: newX, y: newY });
      }, 3000);
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isAngryMode]);

  const handlePointerLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };
  
  const handleReset = () => {
    setExpression('neutral');
    setBackgroundColor(defaultBackgroundColor);
    setEmojiColor(defaultEmojiColor);
    setActiveMenu('main');
    setFeatureOffset({ x: 0, y: 0 });
    setIsAngryMode(false);
    setTapTimestamps([]);
  };
  
  const handleTap = () => {
    if (isAngryMode) return;

    const now = Date.now();
    const newTimestamps = [...tapTimestamps, now].slice(-4);
    setTapTimestamps(newTimestamps);
    
    if (newTimestamps.length === 4) {
      const timeDiff = newTimestamps[3] - newTimestamps[0];
      if (timeDiff < 2000) {
        setTapTimestamps([]);
        setIsAngryMode(true);
        setEmojiColor(angryColor);
        setExpression('angry');

        setTimeout(() => {
          setIsAngryMode(false);
          setEmojiColor(defaultEmojiColor);
          setExpression('neutral');
        }, 3000);
      }
    } else {
        handleRandomize();
    }
  };

  const handleRandomize = () => {
    if (isAngryMode) return;
    const newExpression = allExpressions[Math.floor(Math.random() * allExpressions.length)];
    setExpression(newExpression);
  }

  const renderMenu = () => {
    switch (activeMenu) {
        case 'colors':
            return (
                <>
                     <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft /></Button>
                     <Separator orientation="vertical" className="h-6 mx-2" />
                     <div className="flex items-center gap-2">
                         <div className="relative w-10 h-10 flex items-center justify-center">
                            <Input id="bg-color" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="absolute w-full h-full p-0 opacity-0 cursor-pointer" />
                            <span className="text-sm">BG</span>
                        </div>
                        <div className="relative w-10 h-10 flex items-center justify-center">
                             <Input id="emoji-color" type="color" value={emojiColor} onChange={(e) => setEmojiColor(e.target.value)} className="absolute w-full h-full p-0 opacity-0 cursor-pointer" />
                             <span className="text-sm">Face</span>
                        </div>
                     </div>
                </>
            );
        default:
            return (
                <>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleReset}><RotateCcw className="h-5 w-5" /></Button></TooltipTrigger>
                        <TooltipContent><p>Reset All</p></TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                     <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setExpression('happy')}><Smile className="h-5 w-5" /></Button></TooltipTrigger>
                        <TooltipContent><p>Good Mood</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setExpression('sad')}><Frown className="h-5 w-5" /></Button></TooltipTrigger>
                        <TooltipContent><p>Bad Mood</p></TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setActiveMenu('colors')}><Palette className="h-5 w-5" /></Button></TooltipTrigger>
                        <TooltipContent><p>Colors</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleRandomize}><Wand2 className="h-5 w-5" /></Button></TooltipTrigger>
                        <TooltipContent><p>Random Expression</p></TooltipContent>
                    </Tooltip>
                </>
            );
    }
  }

  return (
    <div 
        className="relative flex flex-col h-full w-full touch-none overflow-hidden transition-colors duration-300"
        style={{ backgroundColor }}
        onPointerLeave={handlePointerLeave}
    >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-0"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '1rem 1rem' }}></div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}
          transition={{ duration: 1.5, type: 'spring' }}
        >
          <motion.div
            className="w-72 h-96 flex items-center justify-center cursor-pointer select-none"
            onTap={handleTap}
          >
            <ClockFace 
                expression={expression} 
                color={emojiColor} 
                pointerX={pointerX}
                pointerY={pointerY}
                featureOffset={featureOffset}
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 w-full bg-background/80 backdrop-blur-sm border-t border-border z-20">
         <TooltipProvider>
            <div className="flex items-center justify-center gap-2 p-4 h-20">
              {renderMenu()}
            </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
