
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
type MenuType = 'main' | 'expressions' | 'colors' | 'accessories' | 'filters' | 'animations' | 'shapes';
export type AnimationType = 'left-right' | 'right-left' | 'up-down' | 'down-up' | 'diag-left-right' | 'diag-right-left' | 'random' | 'none';
export type ShapeType = 'default' | 'square' | 'squircle' | 'tear';

const ClockFace = ({ 
    expression, 
    color, 
    showSunglasses,
    showMustache,
    pointerX,
    pointerY,
    featureOffsetX,
    featureOffsetY,
    onPan,
    onPanStart,
    onPanEnd,
    shape,
}: { 
    expression: Expression, 
    color: string, 
    showSunglasses: boolean,
    showMustache: boolean,
    pointerX: any,
    pointerY: any,
    featureOffsetX: any,
    featureOffsetY: any,
    onPan: (event: any, info: any) => void;
    onPanStart: (event: any, info: any) => void;
    onPanEnd: (event: any, info: any) => void;
    shape: ShapeType;
}) => {
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

  return (
    <motion.div 
      className="relative w-80 h-96 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPan={onPan}
      onPanStart={onPanStart}
      onPanEnd={onPanEnd}
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
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] opacity-5"></div>
            
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


export default function LokiPage() {
  const [expression, setExpression] = useState<Expression>('neutral');
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');
  
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [emojiColor, setEmojiColor] = useState('orangered');
  const [preAngryColor, setPreAngryColor] = useState(emojiColor);
  const [showSunglasses, setShowSunglasses] = useState(false);
  const [showMustache, setShowMustache] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<AnimationType>('random');
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [isAngryMode, setIsAngryMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [shape, setShape] = useState<ShapeType>('default');
  
  const featureOffsetX = useMotionValue(0);
  const featureOffsetY = useMotionValue(0);

  const defaultBackgroundColor = '#000000';
  const defaultEmojiColor = 'orangered';
  
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];
  
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
  const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);
  const dragOrigin = useRef<{ x: number, y: number } | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  
  const handleReset = () => {
    setExpression('neutral');
    setBackgroundColor(defaultBackgroundColor);
    setEmojiColor(defaultEmojiColor);
    setShowSunglasses(false);
    setShowMustache(false);
    setSelectedFilter(null);
    setAnimationType('random');
    setShape('default');
    featureOffsetX.set(0);
    featureOffsetY.set(0);
    setActiveMenu('main');
  };
  
  const handleRandomize = () => {
    const newExpression = allExpressions[Math.floor(Math.random() * allExpressions.length)];
    setExpression(newExpression);
  }

  const handleTap = () => {
    if (isAngryMode || isDragging) return;

    const now = Date.now();
    const newTimestamps = [...tapTimestamps, now].slice(-4);
    setTapTimestamps(newTimestamps);

    if (newTimestamps.length === 4) {
      const timeDiff = newTimestamps[3] - newTimestamps[0];
      if (timeDiff < 2000) {
        setTapTimestamps([]);
        setPreAngryColor(emojiColor);
        setIsAngryMode(true);
        setEmojiColor('red');
        setExpression('angry');

        setTimeout(() => {
          setIsAngryMode(false);
          setEmojiColor(preAngryColor);
          setExpression('neutral');
        }, 2000);
      }
    }
  };

  const handlePanStart = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    setIsDragging(true);
    dragOrigin.current = { x: featureOffsetX.get(), y: featureOffsetY.get() };
  };

  const handlePan = (event: any, info: any) => {
    if (dragOrigin.current) {
        const boundaryX = 40; 
        const boundaryY = 30;
        
        let newX = dragOrigin.current.x + info.offset.x;
        let newY = dragOrigin.current.y + info.offset.y;

        if ((newX**2 / boundaryX**2) + (newY**2 / boundaryY**2) > 1) {
            // If outside, find the angle and project back to the boundary
            const angle = Math.atan2(newY, newX);
            newX = boundaryX * Math.cos(angle);
            newY = boundaryY * Math.sin(angle);
        }

        featureOffsetX.set(newX);
        featureOffsetY.set(newY);
    }
  };

  const handlePanEnd = () => {
    dragOrigin.current = null;
    if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
    }
    dragTimeoutRef.current = setTimeout(() => {
        setIsDragging(false);
    }, 2000);
  };
  
  const filters = [
    { name: 'None', style: {} },
    { name: 'Sepia', style: { background: 'linear-gradient(to right, #704214, #EAE0C8)' } },
    { name: 'Grayscale', style: { background: 'linear-gradient(to right, #333, #ccc)' } },
    { name: 'Invert', style: { background: 'linear-gradient(to right, #f00, #0ff)' } },
    { name: 'Hue-Rotate', style: { background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' } },
    { name: 'Contrast', style: { background: 'linear-gradient(to right, #000, #fff)' } },
    { name: 'Saturate', style: { background: 'linear-gradient(to right, gray, red)' } },
    { name: 'Vintage', style: { background: 'linear-gradient(to right, #6d5a4c, #d5c8b8)' } },
    { name: 'Cool', style: { background: 'linear-gradient(to right, #3a7bd5, #00d2ff)' } },
    { name: 'Warm', style: { background: 'linear-gradient(to right, #f7b733, #fc4a1a)' } },
  ];

  const handleFilterSelect = (filterName: string) => {
    if (selectedFilter === filterName) {
      setSelectedFilter(null); // Deselect
    } else {
      setSelectedFilter(filterName);
    }
  };

  const handleExpressionToggle = (newExpression: Expression) => {
    if (expression === newExpression) {
        setExpression('neutral');
    } else {
        setExpression(newExpression);
    }
  };
  
  const handleShapeToggle = (newShape: ShapeType) => {
    if (shape === newShape) {
      setShape('default');
    } else {
      setShape(newShape);
    }
  };

  const renderMenu = () => {
    switch (activeMenu) {
      case 'expressions':
        return (
          <>
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Tooltip><TooltipTrigger asChild><Button variant={expression === 'happy' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleExpressionToggle('happy')}><Smile className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Happy</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={expression === 'sad' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleExpressionToggle('sad')}><Frown className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Sad</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={expression === 'scared' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleExpressionToggle('scared')}><Ghost className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Scared</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={expression === 'love' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleExpressionToggle('love')}><Heart className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Love</p></TooltipContent></Tooltip>
          </>
        );
      case 'shapes':
        const shapes: { name: ShapeType; label: string }[] = [
          { name: 'default', label: 'Default' },
          { name: 'square', label: 'Square' },
          { name: 'squircle', label: 'Squircle' },
          { name: 'tear', label: 'Tear' },
        ];
        return (
          <>
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            {shapes.map(({ name, label }) => (
                <Tooltip key={name}>
                    <TooltipTrigger asChild>
                        <Button variant={shape === name ? 'secondary' : 'ghost'} onClick={() => handleShapeToggle(name)}>
                            {label}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{label}</p></TooltipContent>
                </Tooltip>
            ))}
          </>
        );
      case 'colors':
        return (
          <>
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="bg-color-input" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}))}>
                        <Paintbrush className="h-4 w-4"/>
                        <Input id="bg-color-input" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Background Color</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="face-color-input" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}))}>
                        <Pipette className="h-4 w-4"/>
                        <Input id="face-color-input" type="color" value={emojiColor} onChange={(e) => setEmojiColor(e.target.value)} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Face Color</p></TooltipContent>
            </Tooltip>
          </>
        );
      case 'accessories':
        return (
          <>
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="sunglasses-switch" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}), "flex items-center gap-2 cursor-pointer", showSunglasses && "bg-accent text-accent-foreground")}>
                        <Glasses className="h-4 w-4" />
                        <Switch id="sunglasses-switch" checked={showSunglasses} onCheckedChange={setShowSunglasses} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Toggle Sunglasses</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="mustache-switch" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}), "flex items-center gap-2 cursor-pointer", showMustache && "bg-accent text-accent-foreground")}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.25,12.05c0,5.65-4.14,7.2-9.25,7.2S3.75,17.7,3.75,12.05c0-4.06,2.23-5.23,3.73-6.23C8.5,5,9.5,2,13,2s4.5,3,5.5,3.82C20,6.82,22.25,7.99,22.25,12.05Z"/></svg>
                        <Switch id="mustache-switch" checked={showMustache} onCheckedChange={setShowMustache} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Toggle Mustache</p></TooltipContent>
            </Tooltip>
          </>
        );
      case 'filters':
        return (
            <div className="flex items-center w-full">
                <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')} className="flex-shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-6 mx-2 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-3 overflow-x-auto pr-4">
                    {filters.map(filter => (
                        <Tooltip key={filter.name}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => handleFilterSelect(filter.name)}
                                    className={cn(
                                        "w-12 h-12 rounded-lg flex-shrink-0 border-2 transition-all duration-200",
                                        selectedFilter === filter.name ? 'border-primary scale-110' : 'border-border'
                                    )}
                                >
                                    <div className="w-full h-full rounded-md" style={filter.style}></div>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent><p>{filter.name}</p></TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        );
        case 'animations':
             const animations: { name: AnimationType, icon: React.ElementType, label: string }[] = [
                { name: 'left-right', icon: ArrowRight, label: 'L-R' },
                { name: 'right-left', icon: ArrowLeft, label: 'R-L' },
                { name: 'up-down', icon: ArrowDown, label: 'U-D' },
                { name: 'down-up', icon: ArrowUp, label: 'D-U' },
                { name: 'diag-left-right', icon: ArrowUpRight, label: 'Diag L-R' },
                { name: 'diag-right-left', icon: ArrowUpLeft, label: 'Diag R-L' },
                { name: 'random', icon: Wand2, label: 'Random' },
            ];
            return (
                <div className="flex items-center w-full">
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <div className="flex-1 flex items-center gap-2 overflow-x-auto pr-4">
                        {animations.map(({name, icon: Icon, label}) => (
                            <Tooltip key={name}>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant={animationType === name ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setAnimationType(prev => prev === name ? 'none' : name)}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{label}</p></TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            );
      default: // 'main'
        return (
          <>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                <span className="text-xs mt-1">Reset</span>
            </Button>
            <Separator orientation="vertical" className="h-full mx-1" />
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('expressions')}>
                <Smile className="h-4 w-4" />
                <span className="text-xs mt-1">Expressions</span>
            </Button>
             <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('animations')}>
                <Sparkles className="h-4 w-4" />
                <span className="text-xs mt-1">Animations</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('shapes')}>
                <Square className="h-4 w-4" />
                <span className="text-xs mt-1">Shapes</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('colors')}>
                <Palette className="h-4 w-4" />
                <span className="text-xs mt-1">Colors</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('accessories')}>
                <Glasses className="h-4 w-4" />
                <span className="text-xs mt-1">Accessories</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('filters')}>
                <Camera className="h-4 w-4" />
                <span className="text-xs mt-1">Filters</span>
            </Button>
            <Separator orientation="vertical" className="h-full mx-1" />
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={handleRandomize}>
                <Wand2 className="h-4 w-4" />
                <span className="text-xs mt-1">Random</span>
            </Button>
          </>
        );
    }
  };


  return (
    <div 
        className="flex h-full w-full flex-col overflow-hidden touch-none transition-colors duration-300"
        style={{ backgroundColor }}
    >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-0"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '1rem 1rem' }}></div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 z-10">
        <motion.div
          className="w-80 h-96 flex items-center justify-center select-none"
          onTap={handleTap}
          style={{ 
            transformStyle: 'preserve-3d',
            filter: selectedFilter && selectedFilter !== 'None' ? `${selectedFilter.toLowerCase().replace('-', '')}(1)` : 'none',
          }}
        >
          <ClockFace 
              expression={expression} 
              color={emojiColor} 
              showSunglasses={showSunglasses} 
              showMustache={showMustache} 
              pointerX={pointerX}
              pointerY={pointerY}
              featureOffsetX={featureOffsetX}
              featureOffsetY={featureOffsetY}
              onPan={handlePan}
              onPanStart={handlePanStart}
              onPanEnd={handlePanEnd}
              shape={shape}
          />
        </motion.div>
      </div>

      <div className="z-20">
        <TooltipProvider>
            <ScrollArea className="w-full whitespace-nowrap bg-background/80 backdrop-blur-sm border-t border-border no-scrollbar">
                <div className="flex items-center justify-center w-max space-x-1 p-2 mx-auto h-16">
                    {renderMenu()}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
        </TooltipProvider>
      </div>
    </div>
  );
}
