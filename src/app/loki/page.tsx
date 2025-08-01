
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { RotateCcw, Sparkles, Glasses, Palette, Wand2, ArrowLeft, Smile, Frown, Heart, Ghost, Paintbrush, Pipette, Camera, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, ArrowUpLeft, Square } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ChatHeader } from '@/components/chat-header';


type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'scared' | 'love';
export type AnimationType = 'left-right' | 'right-left' | 'up-down' | 'down-up' | 'diag-left-right' | 'diag-right-left' | 'random' | 'none';
export type ShapeType = 'default' | 'square' | 'squircle' | 'tear';

export const ClockFace = ({ 
    expression: initialExpression, 
    color, 
    showSunglasses,
    showMustache,
    shape,
    animationType,
    isDragging,
}: { 
    expression: Expression, 
    color: string, 
    showSunglasses: boolean,
    showMustache: boolean,
    shape: ShapeType;
    animationType: AnimationType;
    isDragging: boolean;
}) => {
  const [expression, setExpression] = useState<Expression>(initialExpression);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [isAngryMode, setIsAngryMode] = useState(false);
  const [preAngryColor, setPreAngryColor] = useState(color);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const featureOffsetX = useMotionValue(0);
  const featureOffsetY = useMotionValue(0);

  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
  const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);
  const dragOrigin = useRef<{ x: number, y: number } | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];

  useEffect(() => {
    setExpression(initialExpression);
  }, [initialExpression]);
  
  useEffect(() => {
    if (isAngryMode || isDragging) return;
    
    const stopAnimations = () => {
        if (animationControlsX.current) animationControlsX.current.stop();
        if (animationControlsY.current) animationControlsY.current.stop();
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };

    if (animationType === 'none') {
        stopAnimations();
        animate(featureOffsetX, 0, { type: 'spring', stiffness: 200, damping: 20 });
        animate(featureOffsetY, 0, { type: 'spring', stiffness: 200, damping: 20 });
        return;
    }
    
    stopAnimations();

    const animationOptions = {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
    };
    
    const randomAnimation = () => {
        const newExpression = allExpressions[Math.floor(Math.random() * allExpressions.length)];
        setExpression(newExpression);
        
        const boundaryX = 40; 
        const boundaryY = 30;
        
        let newX, newY;
        
        do {
            newX = Math.random() * (2 * boundaryX) - boundaryX;
            newY = Math.random() * (2 * boundaryY) - boundaryY;
        } while ((newX**2 / boundaryX**2) + (newY**2 / boundaryY**2) > 1);

        animate(featureOffsetX, newX, { type: 'spring', stiffness: 50, damping: 20 });
        animate(featureOffsetY, newY, { type: 'spring', stiffness: 50, damping: 20 });
    };

    switch (animationType) {
        case 'left-right':
            animationControlsX.current = animate(featureOffsetX, [-30, 30], animationOptions);
            break;
        case 'right-left':
            animationControlsX.current = animate(featureOffsetX, [30, -30], animationOptions);
            break;
        case 'up-down':
            animationControlsY.current = animate(featureOffsetY, [-25, 25], animationOptions);
            break;
        case 'down-up':
            animationControlsY.current = animate(featureOffsetY, [25, -25], animationOptions);
            break;
        case 'diag-left-right':
            animationControlsX.current = animate(featureOffsetX, [-30, 30], animationOptions);
            animationControlsY.current = animate(featureOffsetY, [-25, 25], animationOptions);
            break;
        case 'diag-right-left':
             animationControlsX.current = animate(featureOffsetX, [30, -30], animationOptions);
             animationControlsY.current = animate(featureOffsetY, [-25, 25], animationOptions);
            break;
        case 'random':
            animationIntervalRef.current = setInterval(randomAnimation, 3000);
            randomAnimation();
            break;
        default:
            // Do nothing, animations are already stopped
    }

    return stopAnimations;
  }, [animationType, isAngryMode, isDragging]);


  const eyeVariants = {
    neutral: { y: 0, scaleY: 1, height: '2rem' },
    happy: { y: 2, scaleY: 0.9, height: '1.75rem' },
    angry: { y: -2, scaleY: 0.8, height: '1.5rem' },
    sad: { y: 4, scaleY: 0.8, height: '1.75rem' },
    surprised: { y: -3, scaleY: 1.1, height: '2.25rem' },
    scared: { y: -4, scaleY: 1.2, height: '2.5rem' },
    love: { y: 2, scaleY: 1, height: '2rem' },
  };

  const mouthVariants = {
    neutral: { d: "M 30 50 Q 50 50 70 50" },
    happy: { d: "M 30 50 Q 50 65 70 50" },
    angry: { d: "M 30 55 Q 50 40 70 55" },
    sad: { d: "M 30 60 Q 50 50 70 60" },
    surprised: { d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55" },
    scared: { d: "M 35 50 Q 50 65 65 50 A 15 15 0 0 1 35 50" },
    love: { d: "M 30 50 Q 50 75 70 50" },
  };
  
  const eyelidVariants = {
    neutral: { y: 0, rotate: 0 },
    happy: { y: 3, rotate: -5 },
    angry: { y: -2, rotate: 5 },
    sad: { y: 5, rotate: 5 },
    surprised: { y: -4, rotate: 2 },
    scared: { y: -6, rotate: 4 },
    love: { y: -3, rotate: -3 },
  }

  const blushVariants = {
    neutral: { opacity: 0, scale: 0.8 },
    happy: { opacity: 0.8, scale: 1 },
    angry: { opacity: 0.6, scale: 1.1 },
    sad: { opacity: 0.4, scale: 0.9 },
    surprised: { opacity: 0.3, scale: 1 },
    scared: { opacity: 0.5, scale: 1.2 },
    love: { opacity: 0.9, scale: 1.1, filter: 'blur(1px)' },
  }
  
  const smoothPointerX = useSpring(pointerX, { stiffness: 300, damping: 20, mass: 0.5 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 300, damping: 20, mass: 0.5 });
  
  const pupilX = useTransform(smoothPointerX, [0, 1], [-5, 5]);
  const pupilY = useTransform(smoothPointerY, [0, 1], [-4, 4]);

  const pupilScale = useSpring(expression === 'scared' ? 0.8 : 1, { stiffness: 400, damping: 20 });
  
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
  
  const getShapeClipPath = (s: ShapeType) => {
    const paths = {
      default: '50%',
      square: '10%',
      squircle: '30%',
      tear: '50% 50% 50% 50% / 60% 60% 40% 40%',
    };
    return paths[s] || paths.default;
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

  const handleTap = () => {
    if (isAngryMode || isDragging) return;

    const now = Date.now();
    const newTimestamps = [...tapTimestamps, now].slice(-4);
    setTapTimestamps(newTimestamps);

    if (newTimestamps.length === 4) {
      const timeDiff = newTimestamps[3] - newTimestamps[0];
      if (timeDiff < 2000) {
        setTapTimestamps([]);
        setPreAngryColor(color);
        setIsAngryMode(true);
        // setEmojiColor('red'); This should be handled by the parent
        setExpression('angry');

        setTimeout(() => {
          setIsAngryMode(false);
          // setEmojiColor(preAngryColor); This should be handled by the parent
          setExpression('neutral');
        }, 2000);
      }
    }
  };

  return (
    <motion.div 
      className="relative w-80 h-96 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onTap={handleTap}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div 
        className="absolute w-56 h-56 z-10"
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Arms */}
        <motion.div className="absolute top-1/2 -translate-y-1/2 -left-12 w-16 h-8 z-0"
         animate={{ rotate: expression === 'happy' ? -25 : (expression === 'angry' ? -30 : -10), x: expression === 'angry' ? -5 : 0 }}
         transition={{ type: 'spring', stiffness: 200, damping: 10}}
        >
            <div className="w-12 h-2 absolute top-1/2 right-0 -translate-y-1/2 rounded-l-full bg-orangered"></div>
            <div className="w-8 h-8 bg-white rounded-full absolute left-0 top-1/2 -translate-y-1/2 border-2 border-black/70 flex items-center justify-center">
                <div className="relative w-5 h-4 flex items-center justify-center gap-px">
                    <div className="w-2 h-0.5 bg-black/70 rounded-full"></div>
                    <div className="w-1.5 h-0.5 bg-black/70 rounded-full transform rotate-[-25deg]"></div>
                </div>
            </div>
        </motion.div>
         <motion.div className="absolute top-1/2 -translate-y-1/2 -right-12 w-16 h-8 z-0"
          animate={{ rotate: expression === 'surprised' ? 25 : (expression === 'sad' ? 40 : 10), x: expression === 'angry' ? 5 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10}}
         >
            <div className="w-12 h-2 absolute top-1/2 left-0 -translate-y-1/2 rounded-r-full bg-orangered"></div>
             <div className="w-8 h-8 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2 border-2 border-black/70 flex items-center justify-center">
                <div className="relative w-5 h-4 flex items-center justify-center gap-px">
                    <div className="w-2 h-0.5 bg-black/70 rounded-full"></div>
                    <div className="w-1.5 h-0.5 bg-black/70 rounded-full transform rotate-[-25deg]"></div>
                </div>
            </div>
        </motion.div>

        {/* Legs */}
         <div className="absolute bottom-[-34px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 z-0">
              <div className="flex gap-4">
                <div className="w-2.5 h-10" style={{ backgroundColor: '#4a2c0f'}}></div>
                <div className="w-2.5 h-10" style={{ backgroundColor: '#4a2c0f'}}></div>
              </div>
              <div className="flex -mt-0.5 gap-2">
                 <div className="w-8 h-4 rounded-t-sm border-2 border-black/70 flex items-end justify-center bg-orangered"><div className="w-4 h-0.5 bg-white/70 rounded-t-sm"></div></div>
                 <div className="w-8 h-4 rounded-t-sm border-2 border-black/70 flex items-end justify-center bg-orangered"><div className="w-4 h-0.5 bg-white/70 rounded-t-sm"></div></div>
              </div>
         </div>
         
        <motion.div 
          className="w-full h-full shadow-[inset_0_-10px_12px_rgba(0,0,0,0.15),_0_5px_10px_rgba(0,0,0,0.25)] relative overflow-hidden border-4 border-black/70" 
          animate={{ borderRadius: getShapeClipPath(shape), backgroundColor: color }}
          transition={{ duration: 0.3 }}
        >
            {tickMarks}
            <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center relative" style={{ borderRadius: getShapeClipPath(shape) }}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C/svg%3E')] opacity-5"></div>
            
             <motion.div
                className="absolute top-5 left-5 w-1/2 h-1/4 bg-white/20 rounded-full"
                style={{ filter: 'blur(10px)', transform: 'rotate(-25deg)' }}
              />
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ x: featureOffsetX, y: featureOffsetY }}
                    transition={{ duration: 1.5, type: 'spring' }}
                >

                    <motion.div 
                        className="flex justify-between w-40 absolute top-32"
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
                
                    <motion.div 
                        className="flex gap-12 absolute top-1/2 -translate-y-[calc(50%_+_20px)] items-end" 
                    >
                        {/* Left Eye */}
                        <motion.div className="relative" style={{ height: '2rem' }} variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                        <div className="w-8 h-full bg-white rounded-t-full rounded-b-md relative overflow-hidden border-2 border-black/70">
                            <motion.div 
                                className="absolute top-1/2 left-1/2 w-5 h-5 bg-black rounded-full"
                                style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%', scale: pupilScale }}
                            >
                                <motion.div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
                                <motion.div animate={{ opacity: expression === 'love' ? 1 : 0 }} transition={{ duration: 0.1 }}>
                                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                                </motion.div>
                            </motion.div>
                        </div>
                        <motion.div 
                            className="absolute -top-1.5 left-0.5 w-7 h-2.5 bg-black/80"
                            style={{ clipPath: 'path("M0,6 C6,0, 22,0, 28,6")' }}
                            variants={eyelidVariants}
                            animate={expression}
                            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}
                        />
                        </motion.div>

                        {/* Right Eye */}
                        <motion.div className="relative" style={{ height: '2rem' }} variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                        <div className="w-8 h-full bg-white rounded-t-full rounded-b-md relative overflow-hidden border-2 border-black/70">
                            <motion.div 
                                className="absolute top-1/2 left-1/2 w-5 h-5 bg-black rounded-full"
                                style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%', scale: pupilScale }}
                            >
                                <motion.div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
                                <motion.div animate={{ opacity: expression === 'love' ? 1 : 0 }} transition={{ duration: 0.1 }}>
                                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                                </motion.div>
                            </motion.div>
                        </div>
                        <motion.div 
                            className="absolute -top-1.5 left-0.5 w-7 h-2.5 bg-black/80"
                            style={{ clipPath: 'path("M0,6 C6,0, 22,0, 28,6")' }}
                            variants={eyelidVariants}
                            animate={expression}
                            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}
                        />
                        </motion.div>
                    </motion.div>

                    {/* Nose */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[2px] w-1.5 h-1.5 bg-black/70 rounded-full"></div>

                    <motion.div 
                        className="absolute top-1/2 -translate-y-1/2 mt-6" 
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

                    <motion.div
                        className="absolute flex justify-center w-full"
                        style={{ top: '60px', transform: 'translateZ(30px) scale(0.8)' }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: showSunglasses ? 1 : 0, y: showSunglasses ? 0 : -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="relative">
                            <div className="flex justify-between items-center w-[140px] h-[35px]">
                                <div className="w-[55px] h-full bg-black/80 rounded-xl border-2 border-gray-700"></div>
                                <div className="h-1 w-3 border-b-2 border-x-2 border-gray-700 rounded-b-sm self-center"></div>
                                <div className="w-[55px] h-full bg-black/80 rounded-xl border-2 border-gray-700"></div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="absolute flex justify-center w-full"
                        style={{ top: '105px', transform: 'translateZ(25px) scale(0.7)' }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: showMustache ? 1 : 0, scale: showMustache ? 1 : 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg width="100" height="30" viewBox="0 0 100 30">
                            <path d="M 10 15 C 20 -5, 80 -5, 90 15 Q 50 10, 10 15" fill="#4a2c0f" />
                        </svg>
                    </motion.div>

                </motion.div>
            </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
