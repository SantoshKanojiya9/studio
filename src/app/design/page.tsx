
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Sparkles, Glasses, Palette, Wand2, ArrowLeft, Smile, Frown, Heart, Ghost } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';


type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'scared' | 'love';
type MenuType = 'main' | 'colors';

const Face = ({ 
    expression, 
    color, 
    showSunglasses, 
    showMustache,
    pointerX,
    pointerY,
    featureOffsetX,
    featureOffsetY,
}: { 
    expression: Expression, 
    color: string, 
    showSunglasses: boolean,
    showMustache: boolean,
    pointerX: any,
    pointerY: any,
    featureOffsetX: any,
    featureOffsetY: any,
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
  
  const pupilX = useTransform(smoothPointerX, [0, 1], [-12, 12]);
  const pupilY = useTransform(smoothPointerY, [0, 1], [-8, 8]);
  
  const pupilScale = useSpring(expression === 'scared' ? 0.6 : 1, { stiffness: 400, damping: 20 });
  
  const glossX = useTransform(featureOffsetX, (v) => -v / 5);
  const glossY = useTransform(featureOffsetY, (v) => -v / 5);

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
          style={{
             backgroundColor: color
          }}
        >
            <div 
                className="w-full h-full rounded-[50%_50%_40%_40%/60%_60%_40%_40%] bg-gradient-to-br from-white/30 to-transparent flex items-center justify-center p-[10px] relative overflow-hidden"
            >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
            
             <motion.div
                className="absolute top-4 left-4 w-2/3 h-1/3 bg-white/20 rounded-full"
                style={{
                  filter: 'blur(20px)',
                  transform: 'rotate(-30deg)',
                  x: glossX,
                  y: glossY,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />

            <motion.div
                className="absolute inset-0 flex items-center justify-center"
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
                    style={{ top: '175px', transform: 'translateZ(25px)' }}
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
  const featureOffsetX = useMotionValue(0);
  const featureOffsetY = useMotionValue(0);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [isAngryMode, setIsAngryMode] = useState(false);

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

  useEffect(() => {
    // Stop any existing interval when angry mode changes
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
    
    // Start the interval only if not in angry mode
    if (!isAngryMode) {
      animationIntervalRef.current = setInterval(() => {
        const randomExpressionIndex = Math.floor(Math.random() * allExpressions.length);
        const newExpression = allExpressions[randomExpressionIndex];
        setExpression(newExpression);

        const newX = Math.random() * 120 - 60; // -60 to 60
        const newY = Math.random() * 100 - 50; // -50 to 50
        
        animate(featureOffsetX, newX, { type: 'spring', stiffness: 50, damping: 20 });
        animate(featureOffsetY, newY, { type: 'spring', stiffness: 50, damping: 20 });

      }, 3000);
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isAngryMode, featureOffsetX, featureOffsetY]);

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
    setActiveMenu('main');
    featureOffsetX.set(0);
    featureOffsetY.set(0);
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
                     <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setExpression('scared')}><Ghost className="h-5 w-5" /></Button></TooltipTrigger>
                        <TooltipContent><p>Scared</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setExpression('love')}><Heart className="h-5 w-5" /></Button></TooltipTrigger>
                        <TooltipContent><p>Love</p></TooltipContent>
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
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            rotateX: tiltEnabled ? smoothRotateX : 0,
            rotateY: tiltEnabled ? smoothRotateY : 0,
          }}
          transition={{ duration: 1.5, type: 'spring' }}
        >
          <motion.div
            className="w-80 h-80 flex items-center justify-center cursor-pointer select-none"
            style={{ 
              transformStyle: 'preserve-3d'
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

    
