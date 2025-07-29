
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useSpring, animate, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Sparkles, Glasses, Palette, Wand2, ArrowLeft, Smile, Frown, Heart, Ghost, Paintbrush, Pipette, Camera, Orbit, Square, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, ArrowUpLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ChatHeader } from '@/components/chat-header';


type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'scared' | 'love';
type MenuType = 'main' | 'expressions' | 'colors' | 'accessories' | 'filters' | 'base' | 'animations';
export type AnimationType = 'left-right' | 'right-left' | 'up-down' | 'down-up' | 'diag-left-right' | 'diag-right-left' | 'random' | 'none';


const Face = ({ 
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
}: { 
    expression: Expression, 
    color: string, 
    showSunglasses: boolean,
    showMustache: boolean,
    pointerX: any,
    pointerY: any,
    featureOffsetX: any,
    featureOffsetY: any,
    onPan: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
    onPanStart: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
    onPanEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}) => {
  const eyeVariants = {
    neutral: { y: 0, scaleY: 1 },
    happy: { y: 4, scaleY: 0.8 },
    angry: { y: -2, scaleY: 1 },
    sad: { y: 6, scaleY: 0.9 },
    surprised: { y: -3, scaleY: 1.1 },
    scared: { y: -4, scaleY: 1.2, scaleX: 1.1 },
    love: { y: 2, scaleY: 1 },
  };

  const mouthVariants = {
    neutral: {
      d: "M 30 50 Q 50 50 70 50", // Straight line
    },
    happy: {
      d: "M 30 50 Q 50 70 70 50", // Smile
    },
    angry: {
        d: "M 30 60 Q 50 30 70 60", // Angry
    },
    sad: {
        d: "M 30 60 Q 50 50 70 60", // Sad mouth
    },
    surprised: {
        d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55", // Open mouth
    },
    scared: {
        d: "M 35 50 Q 50 65 65 50 A 15 15 0 0 1 35 50", // Open mouth scared
    },
    love: {
      d: "M 30 50 Q 50 75 70 50", // Big smile for love
    },
  };
  
  const eyebrowVariants = {
    neutral: { y: 0, rotate: 0 },
    happy: { y: -4, rotate: -5 },
    angry: { y: 2, rotate: 10 },
    sad: { y: 2, rotate: -10 },
    surprised: { y: -6, rotate: 5 },
    scared: { y: -8, rotate: 3 },
    love: { y: -5, rotate: -5 },
  }

  const eyeLidVariants = {
      closed: { scaleY: 0, y: 5 },
      open: { scaleY: 1, y: 0 },
  }

  const blushVariants = {
    neutral: { opacity: 0, scale: 0.8 },
    happy: { opacity: 0.7, scale: 1 },
    angry: { opacity: 0, scale: 1.1 },
    sad: { opacity: 0, scale: 0.9 },
    surprised: { opacity: 0, scale: 0.9 },
    scared: { opacity: 0, scale: 1.2 },
    love: { opacity: 0.9, scale: 1.1, filter: 'blur(1px)' },
  }
  
  const smoothPointerX = useSpring(pointerX, { stiffness: 300, damping: 20, mass: 0.5 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 300, damping: 20, mass: 0.5 });
  
  const pupilXFromPointer = useTransform(smoothPointerX, [0, 1], [-12, 12]);
  const pupilYFromPointer = useTransform(smoothPointerY, [0, 1], [-8, 8]);
  
  const pupilX = useTransform(() => pupilXFromPointer.get() + featureOffsetX.get() * 0.25);
  const pupilY = useTransform(() => pupilYFromPointer.get() + featureOffsetY.get() * 0.25);

  const pupilScale = useSpring(expression === 'scared' ? 0.6 : 1, { stiffness: 400, damping: 20 });
  

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

  return (
    <motion.div 
      className="relative w-80 h-80"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPan={onPan}
      onPanStart={onPanStart}
      onPanEnd={onPanEnd}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div 
        className="absolute top-10 w-full h-64 z-10"
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div 
          className="w-full h-full rounded-[50%_50%_40%_40%/60%_60%_40%_40%] shadow-[inset_0_-20px_30px_rgba(0,0,0,0.2),_0_10px_20px_rgba(0,0,0,0.3)] relative"
          transition={{ duration: 0.3 }}
        >
            <div className="w-full h-full rounded-[50%_50%_40%_40%/60%_60%_40%_40%] bg-gradient-to-br from-white/30 to-transparent flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: color }}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>

                <motion.div
                    className="absolute top-4 left-4 w-2/3 h-1/3 bg-white/20 rounded-full"
                    style={{
                    filter: 'blur(20px)',
                    transform: 'rotate(-30deg)',
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />

                <div className="absolute inset-0 p-[10px] overflow-hidden rounded-[50%_50%_40%_40%/60%_60%_40%_40%]">
                    <motion.div
                        className="absolute inset-[10px] flex items-center justify-center"
                        style={{ x: featureOffsetX, y: featureOffsetY }}
                        transition={{ duration: 1.5, type: 'spring' }}
                    >
                        <motion.div 
                            className="flex justify-between w-56 absolute top-40"
                        >
                            <motion.div 
                                className="w-12 h-6 bg-pink-400 rounded-full"
                                variants={blushVariants}
                                animate={expression}
                                transition={{ duration: 0.3, type: "spring" }}
                            />
                            <motion.div 
                                className="w-12 h-6 bg-pink-400 rounded-full"
                                variants={blushVariants}
                                animate={expression}
                                transition={{ duration: 0.3, type: "spring" }}
                            />
                        </motion.div>
                    
                        <motion.div 
                            className="flex gap-20 absolute top-28" 
                            style={{ transform: 'translateZ(20px)' }}
                        >
                            <motion.div className="relative" variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                            <div className="w-12 h-10 bg-fuchsia-200 rounded-full relative overflow-hidden" >
                                <motion.div 
                                    className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full"
                                    style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%', scale: pupilScale }}
                                >
                                    <motion.div 
                                        className="w-full h-full bg-black rounded-full origin-bottom flex items-center justify-center"
                                        animate={'open'}
                                        variants={eyeLidVariants}
                                        transition={{
                                            duration: 0.1,
                                            ease: "easeOut"
                                        }}
                                    >
                                        <motion.div animate={{ opacity: expression === 'love' ? 1 : 0 }} transition={{ duration: 0.1 }}>
                                            <Heart className="w-5 h-5 text-red-500 fill-current" />
                                        </motion.div>
                                    </motion.div>
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
                            <motion.div className="relative" variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                            <div className="w-12 h-10 bg-fuchsia-200 rounded-full relative overflow-hidden">
                                <motion.div 
                                    className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full flex items-center justify-center"
                                    style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%', scale: pupilScale }}
                                >
                                    <motion.div animate={{ opacity: expression === 'love' ? 1 : 0 }} transition={{ duration: 0.1 }}>
                                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                                    </motion.div>
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
                        </motion.div>
                        <motion.div 
                            className="absolute bottom-12" 
                            style={{ transform: 'translateZ(10px)' }}
                        >
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
                        </motion.div>

                        <motion.div
                            className="absolute flex justify-center w-full"
                            style={{ top: '110px', transform: 'translateZ(30px)' }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: showSunglasses ? 1 : 0, y: showSunglasses ? 0 : -20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="relative">
                                <div className="flex justify-between items-center w-[180px] h-[45px]">
                                    <div className="w-[70px] h-full bg-black/80 rounded-2xl border-2 border-gray-700"></div>
                                    <div className="h-1 w-4 border-b-2 border-x-2 border-gray-700 rounded-b-sm self-center"></div>
                                    <div className="w-[70px] h-full bg-black/80 rounded-2xl border-2 border-gray-700"></div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            className="absolute flex justify-center w-full"
                            style={{ top: '155px', transform: 'translateZ(25px)' }}
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
            </div>
        </motion.div>
      </motion.div>
       <motion.div 
         className="absolute bottom-0 w-full" style={{ height: '60px', transformStyle: 'preserve-3d', transform: 'perspective(1000px)' }}
         initial={{ y: 50, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gray-700 rounded-full shadow-inner" style={{ transform: 'rotateX(70deg) translateZ(-20px)' }}></div>
           <div className="absolute bottom-[-10px] left-1/2 w-[98%] h-16 bg-gray-800 rounded-full" style={{ transform: 'translateX(-50%) rotateX(80deg) translateZ(-15px)', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}></div>
           <div className="absolute bottom-[-10px] left-1/2 w-full h-10 bg-gradient-to-t from-black/50 to-transparent" style={{ transform: 'translateX(-50%)' }}></div>
      </motion.div>
    </motion.div>
  );
};


export default function DesignPage() {
  const [expression, setExpression] = useState<Expression>('neutral');
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');
  
  const [backgroundColor, setBackgroundColor] = useState('#0a0a0a');
  const [emojiColor, setEmojiColor] = useState('#ffb300');
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [showSunglasses, setShowSunglasses] = useState(false);
  const [showMustache, setShowMustache] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<AnimationType>('random');
  const featureOffsetX = useMotionValue(0);
  const featureOffsetY = useMotionValue(0);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [isAngryMode, setIsAngryMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const defaultBackgroundColor = '#0a0a0a';
  const defaultEmojiColor = '#ffb300';
  const angryColor = 'orangered';

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const rotateX = useTransform(y, [-1, 1], [15, -15]);
  const rotateY = useTransform(x, [-1, 1], [-15, 15]);
  
  const springConfig = { stiffness: 300, damping: 20 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];
  
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
  const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);


   useEffect(() => {
    const stopAnimations = () => {
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        animationControlsX.current?.stop();
        animationControlsY.current?.stop();
        featureOffsetX.set(0);
        featureOffsetY.set(0);
    };

    if (isDragging) {
        stopAnimations();
        return;
    }

    const animationOptions = {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
    };
    
    const randomAnimation = () => {
        const newExpression = allExpressions[Math.floor(Math.random() * allExpressions.length)];
        setExpression(newExpression);
        const newX = Math.random() * 120 - 60;
        const newY = Math.random() * 100 - 50;
        animate(featureOffsetX, newX, { type: 'spring', stiffness: 50, damping: 20 });
        animate(featureOffsetY, newY, { type: 'spring', stiffness: 50, damping: 20 });
    };

    if (isAngryMode || animationType === 'none') {
        setExpression('neutral');
        return stopAnimations;
    }
    
    switch (animationType) {
        case 'left-right':
            animationControlsX.current = animate(featureOffsetX, [-60, 60], animationOptions);
            break;
        case 'right-left':
            animationControlsX.current = animate(featureOffsetX, [60, -60], animationOptions);
            break;
        case 'up-down':
            animationControlsY.current = animate(featureOffsetY, [-50, 50], animationOptions);
            break;
        case 'down-up':
            animationControlsY.current = animate(featureOffsetY, [50, 50], animationOptions);
            break;
        case 'diag-left-right':
            animationControlsX.current = animate(featureOffsetX, [-60, 60], animationOptions);
            animationControlsY.current = animate(featureOffsetY, [-50, 50], animationOptions);
            break;
        case 'diag-right-left':
             animationControlsX.current = animate(featureOffsetX, [60, -60], animationOptions);
             animationControlsY.current = animate(featureOffsetY, [-50, 50], animationOptions);
            break;
        case 'random':
            animationIntervalRef.current = setInterval(randomAnimation, 3000);
            randomAnimation();
            break;
        default:
            stopAnimations();
    }

    return stopAnimations;
  }, [isAngryMode, featureOffsetX, featureOffsetY, animationType, isDragging]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const pointerXVal = e.clientX - rect.left;
    const pointerYVal = e.clientY - rect.top;

    x.set((pointerXVal / width) * 2 - 1);
    y.set((pointerYVal / height) * 2 - 1);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
    pointerX.set(0.5);
    pointerY.set(0.5);
  };
  
  const handleReset = () => {
    setExpression('neutral');
    setBackgroundColor(defaultBackgroundColor);
    setEmojiColor(defaultEmojiColor);
    setTiltEnabled(false);
    setShowSunglasses(false);
    setShowMustache(false);
    setSelectedFilter(null);
    setAnimationType('random');
    featureOffsetX.set(0);
    featureOffsetY.set(0);
    setIsAngryMode(false);
    setTapTimestamps([]);
    setActiveMenu('main');
  };
  
  const handleTap = () => {
    if (isAngryMode || isDragging) return;

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

  const onPanStart = () => {
    setIsDragging(true);
  };

  const onPan = (e: any, info: PanInfo) => {
    featureOffsetX.set(info.offset.x);
    featureOffsetY.set(info.offset.y);
  };
  
  const onPanEnd = () => {
    setIsDragging(false);
    animate(featureOffsetX, 0, { type: 'spring', stiffness: 400, damping: 20 });
    animate(featureOffsetY, 0, { type: 'spring', stiffness: 400, damping: 20 });
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
         case 'base':
            return (
                <>
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Label htmlFor="tilt-switch" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}), "flex items-center gap-2 cursor-pointer", tiltEnabled && "bg-accent text-accent-foreground")}>
                                <Orbit className="h-4 w-4" />
                                <Switch id="tilt-switch" checked={tiltEnabled} onCheckedChange={setTiltEnabled} className="sr-only" />
                            </Label>
                        </TooltipTrigger>
                        <TooltipContent><p>3D Tilt</p></TooltipContent>
                    </Tooltip>
                </>
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
            <Button variant="ghost" onClick={handleReset} className="flex flex-col h-auto p-1">
                <RotateCcw className="h-4 w-4" />
                <span className="text-xs mt-1">Reset</span>
            </Button>
            <Separator orientation="vertical" className="h-10 mx-1" />
            <Button variant="ghost" onClick={() => setActiveMenu('base')} className="flex flex-col h-auto p-1">
                <Square className="h-4 w-4" />
                <span className="text-xs mt-1">Base</span>
            </Button>
            <Button variant="ghost" onClick={() => setActiveMenu('expressions')} className="flex flex-col h-auto p-1">
                <Smile className="h-4 w-4" />
                <span className="text-xs mt-1">Expressions</span>
            </Button>
             <Button variant="ghost" onClick={() => setActiveMenu('animations')} className="flex flex-col h-auto p-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs mt-1">Animations</span>
            </Button>
            <Button variant="ghost" onClick={() => setActiveMenu('colors')} className="flex flex-col h-auto p-1">
                <Palette className="h-4 w-4" />
                <span className="text-xs mt-1">Colors</span>
            </Button>
            <Button variant="ghost" onClick={() => setActiveMenu('accessories')} className="flex flex-col h-auto p-1">
                <Glasses className="h-4 w-4" />
                <span className="text-xs mt-1">Accessories</span>
            </Button>
            <Button variant="ghost" onClick={() => setActiveMenu('filters')} className="flex flex-col h-auto p-1">
                <Camera className="h-4 w-4" />
                <span className="text-xs mt-1">Filters</span>
            </Button>
            <Separator orientation="vertical" className="h-10 mx-1" />
            <Button variant="ghost" onClick={handleRandomize} className="flex flex-col h-auto p-1">
                <Wand2 className="h-4 w-4" />
                <span className="text-xs mt-1">Random</span>
            </Button>
          </>
        );
    }
  };


  return (
    <div 
        className="relative flex flex-col h-full w-full touch-none overflow-hidden transition-colors duration-300"
        style={{ backgroundColor }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
    >
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <ChatHeader />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            rotateX: tiltEnabled ? smoothRotateX : 0,
            rotateY: tiltEnabled ? smoothRotateY : 0,
          }}
          transition={{ duration: 1.5, type: 'spring' }}
          className="mb-10"
        >
          <motion.div
            className="w-80 h-80 flex items-center justify-center cursor-pointer select-none"
            style={{ 
              transformStyle: 'preserve-3d',
              filter: selectedFilter && selectedFilter !== 'None' ? `${selectedFilter.toLowerCase()}(1)` : 'none'
            }}
            onTap={handleTap}
          >
            <Face 
                expression={expression} 
                color={emojiColor} 
                showSunglasses={showSunglasses} 
                showMustache={showMustache} 
                pointerX={pointerX}
                pointerY={pointerY}
                featureOffsetX={featureOffsetX}
                featureOffsetY={featureOffsetY}
                onPan={onPan}
                onPanStart={onPanStart}
                onPanEnd={onPanEnd}
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 w-full z-20">
        <TooltipProvider>
            <ScrollArea className="w-full whitespace-nowrap bg-background/80 backdrop-blur-sm border-t border-border no-scrollbar">
                <div className="flex w-max space-x-1 p-1 mx-auto">
                    {renderMenu()}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
        </TooltipProvider>
      </div>
    </div>
  );
}
