
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles, Move3d, Glasses, Palette, Wand2, SmilePlus, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';


type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
type ActiveMenu = 'main' | 'colors' | 'effects' | 'accessories';

const Face = ({ 
    expression, 
    color, 
    showSunglasses, 
    showMustache,
    isInitialPhase,
    pointerX,
    pointerY
}: { 
    expression: Expression, 
    color: string, 
    showSunglasses: boolean,
    showMustache: boolean,
    isInitialPhase: boolean,
    pointerX: any,
    pointerY: any
}) => {
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
  
  const smoothPointerX = useSpring(pointerX, { stiffness: 300, damping: 20, mass: 0.5 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 300, damping: 20, mass: 0.5 });
  
  const pupilX = useTransform(smoothPointerX, [0, 1], [-12, 12]);
  const pupilY = useTransform(smoothPointerY, [0, 1], [-8, 8]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isInitialPhase) return; // Disable pointer tracking during initial animation
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
      className="relative w-80 h-80"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        if (!isInitialPhase) {
            pointerX.set(0.5);
            pointerY.set(0.5);
        }
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div 
        className="absolute top-10 w-full h-64 z-10"
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div 
          className="w-full h-full rounded-[50%_50%_40%_40%/60%_60%_40%_40%] shadow-[inset_0_-20px_30px_rgba(0,0,0,0.2),_0_10px_20px_rgba(0,0,0,0.3)] relative overflow-hidden" 
          animate={{ backgroundColor: color }}
          transition={{ duration: 0.3 }}
        >
            <div className="w-full h-full rounded-[50%_50%_40%_40%/60%_60%_40%_40%] bg-gradient-to-br from-white/30 to-transparent flex items-center justify-center relative">
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
            
            {/* Cheeks */}
                <div className="flex justify-between w-56 absolute top-40">
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
                </div>
            
            {/* Eyes */}
            <div className="flex gap-20 absolute top-28" style={{ transform: 'translateZ(20px)' }}>
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
            <div className="absolute bottom-12" style={{ transform: 'translateZ(10px)' }}>
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

            {/* Accessories */}
             <motion.div 
                className="absolute"
                style={{ top: '108px', left: '50%', transform: 'translateX(-50%) translateZ(30px)' }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: showSunglasses ? 1 : 0, y: showSunglasses ? 0 : -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <div 
                    className="relative"
                >
                    {/* Lenses and Bridge */}
                    <div className="flex justify-between items-center w-[180px] h-[45px]">
                        <div className="w-[70px] h-full bg-black/80 rounded-2xl border-2 border-gray-700"></div>
                        <div className="h-1 w-4 border-b-2 border-x-2 border-gray-700 rounded-b-sm self-center"></div>
                        <div className="w-[70px] h-full bg-black/80 rounded-2xl border-2 border-gray-700"></div>
                    </div>
                </div>
            </motion.div>
            <motion.div
                className="absolute flex justify-center w-full"
                style={{ top: '175px', transform: 'translateZ(25px)' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: showMustache ? 1 : 0, scale: showMustache ? 1 : 0.5 }}
                transition={{ duration: 0.2 }}
            >
                <svg width="100" height="30" viewBox="0 0 100 30">
                    <path d="M 10 15 C 20 -5, 80 -5, 90 15 Q 50 10, 10 15" fill="#4a2c0f" />
                </svg>
            </motion.div>
            </div>
        </motion.div>
      </motion.div>
       {/* 3D Base */}
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
  const [isInitialPhase, setIsInitialPhase] = useState(true);
  
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('main');

  const [backgroundColor, setBackgroundColor] = useState('#0a0a0a');
  const [emojiColor, setEmojiColor] = useState('#ffb300');
  const [filter, setFilter] = useState('none');
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [showSunglasses, setShowSunglasses] = useState(false);
  const [showMustache, setShowMustache] = useState(false);

  const defaultBackgroundColor = '#0a0a0a';
  const defaultEmojiColor = '#ffb300';
  const defaultFilter = 'none';

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const rotateX = useTransform(y, [-1, 1], [15, -15]);
  const rotateY = useTransform(x, [-1, 1], [-15, 15]);
  
  const springConfig = { stiffness: 300, damping: 20 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const angerTimeout = useRef<NodeJS.Timeout | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resumeFullExpressionAnimation = () => {
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

    const fullExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised'];
    let fullIndex = 0;

    const runFullAnimation = () => {
        setExpression(fullExpressions[fullIndex % fullExpressions.length]);
        fullIndex++;
    };
    
    runFullAnimation();
    animationIntervalRef.current = setInterval(runFullAnimation, 3000);
  };
  
  const startAnimation = () => {
    let phaseTimeout: NodeJS.Timeout;
    
    setIsInitialPhase(true);

    const initialAnimations = [
        { expression: 'happy', pupils: { x: 0, y: 0.5 } },   // left
        { expression: 'surprised', pupils: { x: 1, y: 0.5 } },   // right
        { expression: 'neutral', pupils: { x: 0.5, y: 0 } },   // up
        { expression: 'happy', pupils: { x: 0.5, y: 1 } },   // down
        { expression: 'neutral', pupils: { x: 0.5, y: 0.5 } }, // center
    ];
    let initialIndex = 0;

    const runInitialAnimation = () => {
        const currentAnimation = initialAnimations[initialIndex % initialAnimations.length];
        setExpression(currentAnimation.expression);
        pointerX.set(currentAnimation.pupils.x);
        pointerY.set(currentAnimation.pupils.y);
        initialIndex++;
    };
    
    runInitialAnimation();
    animationIntervalRef.current = setInterval(runInitialAnimation, 3000);

    phaseTimeout = setTimeout(() => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      setIsInitialPhase(false); 
      pointerX.set(0.5);
      pointerY.set(0.5);
      resumeFullExpressionAnimation();
    }, 15000); // 15 seconds

    return () => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      clearTimeout(phaseTimeout);
    };
  };

  useEffect(() => {
    const cleanup = startAnimation();
    return () => {
      cleanup();
      if (clickTimer.current) clearTimeout(clickTimer.current);
      if (angerTimeout.current) clearTimeout(angerTimeout.current);
    };
  }, []);

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
  };

  const handlePointerDown = () => {
    if (isInitialPhase) return;

    if (angerTimeout.current) {
        clearTimeout(angerTimeout.current);
        angerTimeout.current = null;
    }

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    
    clickCount.current += 1;

    if (clickCount.current >= 4) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setExpression('angry');
      setEmojiColor('orangered');
      clickCount.current = 0;
      
      angerTimeout.current = setTimeout(() => {
        setExpression('neutral');
        setEmojiColor(defaultEmojiColor);
        angerTimeout.current = null;
        resumeFullExpressionAnimation(); // Resume full expressions
      }, 2000);
    } else {
      setExpression('happy');
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 800);
    }
  };

  const handlePointerUp = () => {
    if (isInitialPhase) return;
    // Don't change the expression if it's angry, let the timeout handle it.
    if (expression === 'angry') return;
    
    // Only revert to neutral if the anger timeout is not active
    if (!angerTimeout.current) {
        setExpression('neutral');
    }
  };
  
  const handleReset = () => {
    setBackgroundColor(defaultBackgroundColor);
    setEmojiColor(defaultEmojiColor);
    setFilter(defaultFilter);
    setTiltEnabled(false);
    setShowSunglasses(false);
    setShowMustache(false);
  };
  
  const MustacheIcon = () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M7.40039 12.8799C8.36839 11.9119 10.0244 10.9999 12.0004 10.9999C13.9764 10.9999 15.6324 11.9119 16.6004 12.8799C16.8434 13.1229 17.2424 13.1229 17.4854 12.8799C17.7284 12.6369 17.7284 12.2379 17.4854 11.9949C16.2994 10.8089 14.3984 9.99991 12.0004 9.99991C9.60239 9.99991 7.70139 10.8089 6.51539 11.9949C6.27239 12.2379 6.27239 12.6369 6.51539 12.8799C6.75839 13.1229 7.15739 13.1229 7.40039 12.8799Z" />
      </svg>
    );
    
  const BgColorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
  );

  const EmojiColorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5-1.5.7-1.5 1.5.7 1.5 1.5 1.5z"/><path d="M8.5 14.5c.8 0 1.5-.7 1.5-1.5S9.3 11.5 8.5 11.5 7 12.2 7 13s.7 1.5 1.5 1.5z"/><path d="M15.5 14.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5-1.5.7-1.5 1.5.7 1.5 1.5 1.5z"/></svg>
  );

  const menuVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: '0%', opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };
  
  const renderMenu = () => {
    switch(activeMenu) {
        case 'main':
             return (
                <motion.div 
                    key="main"
                    variants={menuVariants} initial="visible" exit="exit" animate="visible"
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="flex items-center gap-4 whitespace-nowrap"
                >
                    <Button variant="ghost" className="flex items-center gap-2 p-2 h-10" onClick={handleReset} aria-label="Reset to defaults">
                        <RotateCcw className="h-5 w-5" />
                        <span className="text-sm">Reset</span>
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 p-2 h-10" onClick={() => setActiveMenu('colors')}>
                        <Palette className="h-5 w-5" />
                        <span className="text-sm">Colors</span>
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 p-2 h-10" onClick={() => setActiveMenu('effects')}>
                        <Wand2 className="h-5 w-5" />
                        <span className="text-sm">Effects</span>
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 p-2 h-10" onClick={() => setActiveMenu('accessories')}>
                        <SmilePlus className="h-5 w-5" />
                        <span className="text-sm">Accessories</span>
                    </Button>
                </motion.div>
            );
        case 'colors':
            return (
                <motion.div 
                    key="colors"
                    variants={menuVariants} initial="hidden" animate="visible" exit="exit"
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="flex items-center gap-4 whitespace-nowrap"
                >
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <Label htmlFor="bg-color" className="sr-only">Background Color</Label>
                            <BgColorIcon />
                            <Input id="bg-color" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="absolute w-full h-full p-0 opacity-0 cursor-pointer" />
                        </div>
                        <span className="text-sm text-muted-foreground">Background</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <Label htmlFor="emoji-color" className="sr-only">Face Color</Label>
                            <EmojiColorIcon/>
                            <Input id="emoji-color" type="color" value={emojiColor} onChange={(e) => setEmojiColor(e.target.value)} className="absolute w-full h-full p-0 opacity-0 cursor-pointer" />
                        </div>
                        <span className="text-sm text-muted-foreground">Face</span>
                    </div>
                </motion.div>
            );
        case 'effects':
             return (
                 <motion.div 
                    key="effects"
                    variants={menuVariants} initial="hidden" animate="visible" exit="exit"
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="flex items-center gap-4 whitespace-nowrap"
                >
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="w-32">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="h-10">
                                <SelectValue asChild>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    <span className="sr-only md:not-sr-only">Filter</span>
                                </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="grayscale(100%)">Grayscale</SelectItem>
                                <SelectItem value="sepia(100%)">Sepia</SelectItem>
                                <SelectItem value="invert(100%)">Invert</SelectItem>
                                <SelectItem value="blur(4px)">Blur</SelectItem>
                                <SelectItem value="saturate(2)">Saturate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Switch id="tilt-switch" checked={tiltEnabled} onCheckedChange={setTiltEnabled} />
                                    <Label htmlFor="tilt-switch" className="sr-only">3D Tilt Effect</Label>
                                    <Move3d className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent><p>Toggle 3D Tilt Effect</p></TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                </motion.div>
            );
        case 'accessories':
            return (
                <motion.div 
                    key="accessories"
                    variants={menuVariants} initial="hidden" animate="visible" exit="exit"
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="flex items-center gap-4 whitespace-nowrap"
                >
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setShowSunglasses(prev => !prev)} className={cn(showSunglasses && 'bg-accent text-accent-foreground')}>
                                    <Glasses className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Toggle Sunglasses</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setShowMustache(prev => !prev)} className={cn(showMustache && 'bg-accent text-accent-foreground')}>
                                <MustacheIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Toggle Mustache</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </motion.div>
            );
        default:
            return null;
    }
  };


  return (
    <div 
        className="relative flex flex-col min-h-full w-full touch-none overflow-hidden transition-colors duration-300"
        style={{ backgroundColor }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-32">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold">Interactive Emoji</h1>
          <p className="text-muted-foreground">
            {isInitialPhase ? "Waking up..." : "Click the emoji to see it change expression!"}
          </p>
           <p className="text-xs text-muted-foreground">
            {isInitialPhase ? "(It's looking around!)" : "(Its eyes will follow you, too!)"}
          </p>
        </div>

        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            rotateX: tiltEnabled ? smoothRotateX : 0,
            rotateY: tiltEnabled ? smoothRotateY : 0,
          }}
        >
          <motion.div
            className="w-80 h-80 flex items-center justify-center cursor-pointer select-none mb-4"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp} 
            style={{ 
              filter: filter !== 'none' ? filter : undefined,
              transformStyle: 'preserve-3d'
            }}
          >
            <Face 
                expression={expression} 
                color={emojiColor} 
                showSunglasses={showSunglasses} 
                showMustache={showMustache} 
                isInitialPhase={isInitialPhase}
                pointerX={pointerX}
                pointerY={pointerY}
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 w-full bg-background/80 backdrop-blur-sm border-t border-border z-20">
         <div className="flex items-center gap-4 overflow-x-auto p-4">
             <AnimatePresence mode="wait">
                 {renderMenu()}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
