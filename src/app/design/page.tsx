

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useSpring, animate, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { RotateCcw, Sparkles, Glasses, Palette, Wand2, ArrowLeft, Smile, Frown, Heart, Ghost, Paintbrush, Pipette, Camera, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, ArrowUpLeft, Square, User as UserIcon, Eye, Meh, ChevronsRight, Save, Users, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabaseClient';


export type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'scared' | 'love';
type MenuType = 'main' | 'expressions' | 'colors' | 'accessories' | 'filters' | 'animations' | 'shapes' | 'face' | 'eyes' | 'mouth' | 'eyebrows';
export type AnimationType = 'left-right' | 'right-left' | 'up-down' | 'down-up' | 'diag-left-right' | 'diag-right-left' | 'random' | 'none';
export type ShapeType = 'default' | 'square' | 'squircle' | 'tear' | 'blob';
type FeatureStyle = 'default' | 'male-1' | 'male-2' | 'male-3' | 'female-1' | 'female-2' | 'female-3';
type ModelType = 'emoji' | 'loki';


export type EmojiState = {
    id: string;
    created_at?: string;
    user_id?: string;
    model: ModelType;
    expression: Expression;
    background_color: string;
    emoji_color: string;
    show_sunglasses: boolean;
    show_mustache: boolean;
    selected_filter: string | null;
    animation_type: AnimationType;
    shape: ShapeType;
    eye_style: FeatureStyle;
    mouth_style: FeatureStyle;
    eyebrow_style: FeatureStyle;
    feature_offset_x: number;
    feature_offset_y: number;
    user?: {
      id: string;
      name: string;
      picture: string;
    }
};


export const Face = ({ 
    expression: initialExpression, 
    color,
    setColor,
    show_sunglasses, 
    show_mustache,
    shape,
    eye_style,
    mouth_style,
    eyebrow_style,
    animation_type,
    isDragging,
    onPan,
    onPanStart,
    onPanEnd,
    feature_offset_x,
    feature_offset_y,
}: { 
    expression: Expression, 
    color: string, 
    setColor: (color: string) => void,
    show_sunglasses: boolean,
    show_mustache: boolean,
    shape: ShapeType;
    eye_style: FeatureStyle;
    mouth_style: FeatureStyle;
    eyebrow_style: FeatureStyle;
    animation_type: AnimationType;
    isDragging: boolean;
    onPan?: (event: any, info: any) => void;
    onPanStart?: (event: any, info: any) => void;
    onPanEnd?: (event: any, info: any) => void;
    feature_offset_x: MotionValue<number>;
    feature_offset_y: MotionValue<number>;
}) => {
  const [expression, setExpression] = useState<Expression>(initialExpression);
  const [isAngryMode, setIsAngryMode] = useState(false);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
  const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);
  
  const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];

  useEffect(() => {
    // Don't update expression if angry mode is active
    if (!isAngryMode) {
      setExpression(initialExpression);
    }
  }, [initialExpression, isAngryMode]);

  useEffect(() => {
    if (isAngryMode || isDragging || animation_type === 'none' || (feature_offset_x.get() !== 0 || feature_offset_y.get() !== 0)) {
        if (animationControlsX.current) animationControlsX.current.stop();
        if (animationControlsY.current) animationControlsY.current.stop();
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        
        if (animation_type === 'none' && !isDragging) {
             animate(feature_offset_x, feature_offset_x.get() || 0, { type: 'spring', stiffness: 200, damping: 20 });
             animate(feature_offset_y, feature_offset_y.get() || 0, { type: 'spring', stiffness: 200, damping: 20 });
        }
        return;
    };
    
    const stopAnimations = () => {
        if (animationControlsX.current) animationControlsX.current.stop();
        if (animationControlsY.current) animationControlsY.current.stop();
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
    
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
        
        const boundaryX = 80; 
        const boundaryY = 60;
        
        let newX, newY;
        
        do {
            newX = Math.random() * (2 * boundaryX) - boundaryX;
            newY = Math.random() * (2 * boundaryY) - boundaryY;
        } while ((newX**2 / boundaryX**2) + (newY**2 / boundaryY**2) > 1);

        animate(feature_offset_x, newX, { type: 'spring', stiffness: 50, damping: 20 });
        animate(feature_offset_y, newY, { type: 'spring', stiffness: 50, damping: 20 });
    };

    switch (animation_type) {
        case 'left-right':
            animationControlsX.current = animate(feature_offset_x, [-60, 60], animationOptions);
            break;
        case 'right-left':
            animationControlsX.current = animate(feature_offset_x, [60, -60], animationOptions);
            break;
        case 'up-down':
            animationControlsY.current = animate(feature_offset_y, [-50, 50], animationOptions);
            break;
        case 'down-up':
            animationControlsY.current = animate(feature_offset_y, [50, 50], animationOptions);
            break;
        case 'diag-left-right':
            animationControlsX.current = animate(feature_offset_x, [-60, 60], animationOptions);
            animationControlsY.current = animate(feature_offset_y, [-50, 50], animationOptions);
            break;
        case 'diag-right-left':
             animationControlsX.current = animate(feature_offset_x, [60, -60], animationOptions);
             animationControlsY.current = animate(feature_offset_y, [-50, 50], animationOptions);
            break;
        case 'random':
            animationIntervalRef.current = setInterval(randomAnimation, 3000);
            randomAnimation();
            break;
        default:
            // Do nothing, animations are already stopped
    }

    return stopAnimations;
  }, [animation_type, isAngryMode, isDragging, feature_offset_x, feature_offset_y]);


  const eyeVariants = {
    neutral: { y: 0, scaleY: 1 },
    happy: { y: 4, scaleY: 0.8 },
    angry: { y: 2, scaleY: 0.8, rotate: -2 },
    sad: { y: 6, scaleY: 0.9 },
    surprised: { y: -3, scaleY: 1.1 },
    scared: { y: -4, scaleY: 1.2, scaleX: 1.1 },
    love: { y: 2, scaleY: 1 },
  };

  const mouthVariants: Record<FeatureStyle, any> = {
    default: { d: "M 30 50 Q 50 60 70 50" },
    'male-1': { d: "M 30 55 H 70" },
    'male-2': { d: "M 30 50 Q 50 40 70 50" },
    'male-3': { d: "M 30 60 Q 50 70 70 60" },
    'female-1': { d: "M 30 55 Q 50 70 70 55" },
    'female-2': { d: "M 25 50 C 35 60, 65 60, 75 50" },
    'female-3': { d: "M 40 55 A 10 5 0 0 0 60 55" },
  };

  const expressionMouthVariants = {
    neutral: { d: mouthVariants[mouth_style]?.d || mouthVariants.default.d },
    happy: { d: "M 30 50 Q 50 70 70 50" },
    angry: { d: "M 25 60 Q 50 35 75 60" },
    sad: { d: "M 30 60 Q 50 50 70 60" },
    surprised: { d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55" },
    scared: { d: "M 35 50 Q 50 65 65 50 A 15 15 0 0 1 35 50" },
    love: { d: "M 30 50 Q 50 75 70 50" },
  };
  
  const eyebrowVariants = {
    neutral: { y: 0, rotate: 0 },
    happy: { y: -4, rotate: -5 },
    angry: { y: 4, rotate: 20 },
    sad: { y: 2, rotate: -10 },
    surprised: { y: -6, rotate: 5 },
    scared: { y: -8, rotate: 3 },
    love: { y: -5, rotate: -5 },
  }

  const blushVariants = {
    neutral: { opacity: 0, scale: 0.8 },
    happy: { opacity: 0.7, scale: 1 },
    angry: { opacity: 0, scale: 1.2, y: 5 },
    sad: { opacity: 0, scale: 0.9 },
    surprised: { opacity: 0, scale: 0.9 },
    scared: { opacity: 0, scale: 1.2 },
    love: { opacity: 0.9, scale: 1.1, filter: 'blur(1px)' },
  }
  
  const smoothPointerX = useSpring(pointerX, { stiffness: 300, damping: 20, mass: 0.5 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 300, damping: 20, mass: 0.5 });
  
  const pupilXFromPointer = useTransform(smoothPointerX, [0, 1], [-12, 12]);
  const pupilYFromPointer = useTransform(smoothPointerY, [0, 1], [-8, 8]);
  
  const pupilX = useTransform(() => pupilXFromPointer.get() + feature_offset_x.get() * 0.2);
  const pupilY = useTransform(() => pupilYFromPointer.get() + feature_offset_y.get() * 0.2);

  const pupilScale = useSpring(expression === 'scared' ? 0.6 : 1, { stiffness: 400, damping: 20 });
  
  const handleTap = () => {
    if (isAngryMode) return;
  
    const now = Date.now();
    const newTimestamps = [...tapTimestamps, now].filter(t => now - t < 2000);
    setTapTimestamps(newTimestamps);
  
    if (newTimestamps.length >= 4) {
      setIsAngryMode(true);
      setExpression('angry');
      const originalColor = color;
      setColor('orangered');
      setTapTimestamps([]);
  
      setTimeout(() => {
        setIsAngryMode(false);
        setColor(originalColor);
        // The useEffect for initialExpression will reset the expression
        setExpression(initialExpression);
      }, 2000);
    }
  };

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
    const paths: Record<ShapeType, string> = {
        default: '50% 50% 40% 40% / 60% 60% 40% 40%',
        square: '10%',
        squircle: '30%',
        tear: '50% 50% 50% 50% / 60% 60% 40% 40%',
        blob: '40% 60% 40% 60% / 60% 40% 60% 40%',
    };
    return paths[s] || paths.default;
  };
  
  const renderEye = (style: FeatureStyle) => {
    const eyeBase = (
      <div className="w-12 h-10 bg-white rounded-full relative overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full"
          style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%', scale: pupilScale }}
        >
          <motion.div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
          <motion.div className="flex items-center justify-center w-full h-full" animate={{ opacity: expression === 'love' ? 1 : 0 }} transition={{ duration: 0.1 }}>
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </motion.div>
        </motion.div>
      </div>
    );
    switch (style) {
      case 'male-1': return <div className="w-12 h-8 bg-white rounded-lg relative overflow-hidden">{eyeBase}</div>;
      case 'male-2': return <div className="w-12 h-10 bg-white rounded-t-full relative overflow-hidden">{eyeBase}</div>;
      case 'male-3': return <div className="w-10 h-10 bg-white rounded-md relative overflow-hidden">{eyeBase}</div>;
      case 'female-1': return <div className="w-12 h-10 bg-white rounded-full relative overflow-hidden border-2 border-black"><div className="absolute -top-1 right-0 w-4 h-4 bg-white" style={{clipPath:'polygon(0 0, 100% 0, 100% 100%)'}}/>{eyeBase}</div>;
      case 'female-2': return <div className="w-12 h-12 bg-white rounded-full relative overflow-hidden flex items-center justify-center">{eyeBase}</div>;
      case 'female-3': return <div className="w-14 h-8 bg-white rounded-tl-2xl rounded-br-2xl relative overflow-hidden">{eyeBase}</div>;
      default: return eyeBase;
    }
  };

  const renderEyebrow = (style: FeatureStyle, isRight?: boolean) => {
    const baseStyle: React.CSSProperties = {
      clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)',
      transformOrigin: 'center',
      transform: isRight ? 'scaleX(-1)' : 'none',
    };
    const eyebrowMotion = {
        variants: eyebrowVariants,
        animate: expression,
        transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 15 }
    };

    switch (style) {
      case 'male-1': return <motion.div className="absolute -top-3 left-0 w-14 h-4 bg-black" style={{ ...baseStyle, clipPath: 'polygon(0 0, 100% 20%, 90% 100%, 10% 100%)' }} {...eyebrowMotion} />;
      case 'male-2': return <motion.div className="absolute -top-4 left-0 w-12 h-5 bg-black" style={{ ...baseStyle, borderRadius: '4px' }} {...eyebrowMotion} />;
      case 'male-3': return <motion.div className="absolute -top-2 left-0 w-12 h-3 bg-black" style={baseStyle} {...eyebrowMotion} />;
      case 'female-1': return <motion.div className="absolute -top-4 left-0 w-12 h-3 bg-black" style={{ ...baseStyle, clipPath: 'path("M0,10 C10,0 40,0 50,10")' }} {...eyebrowMotion} />;
      case 'female-2': return <motion.div className="absolute -top-3 left-0 w-12 h-2.5 bg-black" style={{ ...baseStyle }} {...eyebrowMotion} />;
      case 'female-3': return <motion.div className="absolute -top-3 left-0 w-12 h-4 bg-black/80" style={{ ...baseStyle, clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)' }} {...eyebrowMotion} />;
      default: return <motion.div className="absolute -top-3 left-0 w-12 h-4 bg-black" style={baseStyle} {...eyebrowMotion} />;
    }
  };

  return (
    <motion.div 
      className="relative w-80 h-96 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPan={onPan}
      onPanStart={onPanStart}
      onPanEnd={onPanEnd}
      onTap={handleTap}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div 
        className="absolute w-full h-64 z-10 flex items-center justify-center"
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div 
          className="w-full h-full shadow-[inset_0_-20px_30px_rgba(0,0,0,0.2),_0_10px_20px_rgba(0,0,0,0.3)] relative"
          animate={{ borderRadius: getShapeClipPath(shape) }}
          transition={{ duration: 0.3 }}
        >
            <motion.div 
                className="w-full h-full bg-gradient-to-br from-white/30 to-transparent flex items-center justify-center relative overflow-hidden"
                animate={{ backgroundColor: color, borderRadius: getShapeClipPath(shape) }}
                transition={{ duration: 0.2 }}
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>

                <motion.div
                    className="absolute top-4 left-4 w-2/3 h-1/3 bg-white/20 rounded-full"
                    style={{
                    filter: 'blur(20px)',
                    transform: 'rotate(-30deg)',
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />

                <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: getShapeClipPath(shape) }}>
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ x: feature_offset_x, y: feature_offset_y }}
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
                                {renderEye(eye_style)}
                                {renderEyebrow(eyebrow_style)}
                            </motion.div>
                            <motion.div className="relative" variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                                {renderEye(eye_style)}
                                {renderEyebrow(eyebrow_style, true)}
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
                                    variants={expressionMouthVariants}
                                    animate={expression}
                                    transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
                                />
                            </svg>
                        </motion.div>

                        <motion.div
                            className="absolute flex justify-center w-full"
                            style={{ top: '110px', transform: 'translateZ(30px)' }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: show_sunglasses ? 1 : 0, y: show_sunglasses ? 0 : -20 }}
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
                            style={{ top: '170px', transform: 'translateZ(25px)' }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: show_mustache ? 1 : 0, scale: show_mustache ? 1 : 0.5 }}
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
       <motion.div 
         className="absolute bottom-10 w-full pb-2" style={{ height: '60px', transformStyle: 'preserve-3d', transform: 'perspective(1000px)' }}
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


export const ClockFace = ({ 
    expression: initialExpression, 
    color,
    setColor,
    show_sunglasses,
    show_mustache,
    shape,
    eye_style,
    mouth_style,
    eyebrow_style,
    animation_type,
    isDragging,
    isInteractive = true,
    onPan,
    onPanStart,
    onPanEnd,
    feature_offset_x,
    feature_offset_y,
}: { 
    expression: Expression, 
    color: string, 
    setColor: (color: string) => void,
    show_sunglasses: boolean,
    show_mustache: boolean,
    shape: ShapeType;
    eye_style: FeatureStyle;
    mouth_style: FeatureStyle;
    eyebrow_style: FeatureStyle;
    animation_type: AnimationType;
    isDragging: boolean;
    isInteractive?: boolean;
    onPan?: (event: any, info: any) => void;
    onPanStart?: (event: any, info: any) => void;
    onPanEnd?: (event: any, info: any) => void;
    feature_offset_x: MotionValue<number>;
    feature_offset_y: MotionValue<number>;
}) => {
  const [expression, setExpression] = useState<Expression>(initialExpression);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [isAngryMode, setIsAngryMode] = useState(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
  const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);

  const nonAngryExpressions: Expression[] = ['neutral', 'happy', 'sad', 'surprised', 'scared', 'love'];

  useEffect(() => {
    if (!isAngryMode) {
      setExpression(initialExpression);
    }
  }, [initialExpression, isAngryMode]);
  
  useEffect(() => {
    if (!isInteractive || isAngryMode || isDragging || animation_type === 'none' || (feature_offset_x.get() !== 0 || feature_offset_y.get() !== 0)) {
        if (animationControlsX.current) animationControlsX.current.stop();
        if (animationControlsY.current) animationControlsY.current.stop();
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        
        if (animation_type === 'none' && !isDragging) {
             animate(feature_offset_x, feature_offset_x.get() || 0, { type: 'spring', stiffness: 200, damping: 20 });
             animate(feature_offset_y, feature_offset_y.get() || 0, { type: 'spring', stiffness: 200, damping: 20 });
        }
        return;
    };
    
    const stopAnimations = () => {
        if (animationControlsX.current) animationControlsX.current.stop();
        if (animationControlsY.current) animationControlsY.current.stop();
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };

    stopAnimations();

    const animationOptions = {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
    };
    
    const randomAnimation = () => {
        const newExpression = nonAngryExpressions[Math.floor(Math.random() * nonAngryExpressions.length)];
        setExpression(newExpression);
        
        const boundaryX = 40; 
        const boundaryY = 30;
        
        let newX, newY;
        
        do {
            newX = Math.random() * (2 * boundaryX) - boundaryX;
            newY = Math.random() * (2 * boundaryY) - boundaryY;
        } while ((newX**2 / boundaryX**2) + (newY**2 / boundaryY**2) > 1);

        animate(feature_offset_x, newX, { type: 'spring', stiffness: 50, damping: 20 });
        animate(feature_offset_y, newY, { type: 'spring', stiffness: 50, damping: 20 });
    };

    switch (animation_type) {
        case 'left-right':
            animationControlsX.current = animate(feature_offset_x, [-30, 30], animationOptions);
            break;
        case 'right-left':
            animationControlsX.current = animate(feature_offset_x, [30, -30], animationOptions);
            break;
        case 'up-down':
            animationControlsY.current = animate(feature_offset_y, [-25, 25], animationOptions);
            break;
        case 'down-up':
            animationControlsY.current = animate(feature_offset_y, [25, -25], animationOptions);
            break;
        case 'diag-left-right':
            animationControlsX.current = animate(feature_offset_x, [-30, 30], animationOptions);
            animationControlsY.current = animate(feature_offset_y, [-25, 25], animationOptions);
            break;
        case 'diag-right-left':
             animationControlsX.current = animate(feature_offset_x, [30, -30], animationOptions);
             animationControlsY.current = animate(feature_offset_y, [-25, 25], animationOptions);
            break;
        case 'random':
            animationIntervalRef.current = setInterval(randomAnimation, 3000);
            randomAnimation();
            break;
        default:
            // Do nothing, animations are already stopped
    }

    return stopAnimations;
  }, [animation_type, isAngryMode, isDragging, feature_offset_x, feature_offset_y, isInteractive]);


  const eyeVariants = {
    neutral: { y: 0, scaleY: 1, height: '2rem' },
    happy: { y: 2, scaleY: 0.9, height: '1.75rem' },
    angry: { y: -2, scaleY: 0.8, height: '1.5rem' },
    sad: { y: 4, scaleY: 0.8, height: '1.75rem' },
    surprised: { y: -3, scaleY: 1.1, height: '2.25rem' },
    scared: { y: -4, scaleY: 1.2, height: '2.5rem' },
    love: { y: 2, scaleY: 1, height: '2rem' },
  };

  const mouthVariants: Record<FeatureStyle, any> = {
    default: { d: "M 30 50 Q 50 50 70 50" },
    'male-1': { d: "M 30 55 H 70" },
    'male-2': { d: "M 30 45 Q 50 40 70 45" },
    'male-3': { d: "M 30 60 Q 50 65 70 60" },
    'female-1': { d: "M 30 55 Q 50 65 70 55" },
    'female-2': { d: "M 25 50 C 35 60, 65 60, 75 50" },
    'female-3': { d: "M 40 55 A 10 5 0 0 0 60 55" },
  };

  const expressionMouthVariants = {
    neutral: { d: mouthVariants[mouth_style]?.d || mouthVariants.default.d },
    happy: { d: "M 30 50 Q 50 65 70 50" },
    angry: { d: "M 30 55 Q 50 40 70 55" },
    sad: { d: "M 30 60 Q 50 50 70 60" },
    surprised: { d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55" },
    scared: { d: "M 35 50 Q 50 65 65 50 A 15 15 0 0 1 35 50" },
    love: { d: "M 30 50 Q 50 75 70 50" },
  };
  
  const eyebrowVariants = {
    neutral: { y: 0, rotate: 0 },
    happy: { y: -2, rotate: -5 },
    angry: { y: 2, rotate: 5 },
    sad: { y: 3, rotate: 5 },
    surprised: { y: -3, rotate: 2 },
    scared: { y: -4, rotate: 4 },
    love: { y: -1, rotate: -3 },
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
  
  const pupilXFromPointer = useTransform(smoothPointerX, [0, 1], [-5, 5]);
  const pupilYFromPointer = useTransform(smoothPointerY, [0, 1], [-4, 4]);

  const pupilX = useTransform(() => pupilXFromPointer.get() + feature_offset_x.get() * 0.2);
  const pupilY = useTransform(() => pupilYFromPointer.get() + feature_offset_y.get() * 0.2);

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
    const paths: Record<ShapeType, string> = {
      default: '50%',
      square: '10%',
      squircle: '30%',
      tear: '50% 50% 50% 50% / 60% 60% 40% 40%',
      blob: '50%' // blob not supported for loki, will default
    };
    return paths[s] || paths.default;
  };
  
  // Ensure blob shape is not used for loki
  const currentShape = shape === 'blob' ? 'default' : shape;

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
    if (!isInteractive || isAngryMode) return;

    const now = Date.now();
    const newTimestamps = [...tapTimestamps, now].filter(t => now - t < 2000);
    setTapTimestamps(newTimestamps);

    if (newTimestamps.length >= 4) {
      setIsAngryMode(true);
      setExpression('angry');
      const originalColor = color;
      setColor('red');
      setTapTimestamps([]);
      
      setTimeout(() => {
        setIsAngryMode(false);
        setColor(originalColor);
        setExpression(initialExpression);
      }, 2000);
    }
  };
  
  const armColor = expression === 'angry' ? 'red' : 'orangered';

  const renderEye = (style: FeatureStyle) => {
    const eyeBase = (
      <div className="w-8 h-full bg-white rounded-t-full rounded-b-md relative overflow-hidden border-2 border-black/70">
        <motion.div 
            className="absolute top-1/2 left-1/2 w-5 h-5 bg-black rounded-full"
            style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%', scale: pupilScale }}
        >
            <motion.div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
            <motion.div className="flex items-center justify-center w-full h-full" animate={{ opacity: expression === 'love' ? 1 : 0 }} transition={{ duration: 0.1 }}>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
        </motion.div>
      </div>
    );

    // Clock model has a more fixed eye structure but we can still adapt
    switch (style) {
      case 'male-1': return <div className="w-8 h-full bg-white rounded-lg relative overflow-hidden border-2 border-black/70">{eyeBase.props.children}</div>;
      case 'male-2': return <div className="w-8 h-full bg-white rounded-t-lg relative overflow-hidden border-2 border-black/70">{eyeBase.props.children}</div>;
      case 'female-1': return <div className="w-8 h-full bg-white rounded-full relative overflow-hidden border-2 border-black/70">{eyeBase.props.children}</div>;
      default: return eyeBase;
    }
  };

  const renderEyebrow = (style: FeatureStyle, isRight?: boolean) => {
    const baseStyle: React.CSSProperties = {
      transformOrigin: 'center',
      transform: isRight ? 'scaleX(-1)' : 'none',
    };
     const eyebrowMotion = {
        variants: eyebrowVariants,
        animate: expression,
        transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 15 }
    };

    switch (style) {
      case 'male-1': return <motion.div className="absolute -top-1.5 left-0 w-7 h-2 bg-black/80" style={{ ...baseStyle, clipPath: 'polygon(0 0, 100% 20%, 90% 100%, 10% 100%)' }} {...eyebrowMotion} />;
      case 'male-2': return <motion.div className="absolute -top-2 left-0 w-7 h-2.5 bg-black/80" style={{ ...baseStyle, borderRadius: '2px' }} {...eyebrowMotion} />;
      case 'male-3': return <motion.div className="absolute -top-1 left-0 w-7 h-1.5 bg-black/80" style={baseStyle} {...eyebrowMotion} />;
      case 'female-1': return <motion.div className="absolute -top-2 left-0 w-7 h-2 bg-black/80" style={{ ...baseStyle, clipPath: 'path("M0,6 C6,0, 22,0, 28,6")' }} {...eyebrowMotion} />;
      case 'female-2': return <motion.div className="absolute -top-1.5 left-0 w-7 h-1.5 bg-black/80" style={{ ...baseStyle }} {...eyebrowMotion} />;
      case 'female-3': return <motion.div className="absolute -top-2 left-0 w-7 h-2 bg-black/70" style={{ ...baseStyle, clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)' }} {...eyebrowMotion} />;
      default: return <motion.div className="absolute -top-1.5 left-0.5 w-7 h-2.5 bg-black/80" style={{ ...baseStyle, clipPath: 'path("M0,6 C6,0, 22,0, 28,6")' }} {...eyebrowMotion} />;
    }
  };


  return (
    <motion.div 
      className="relative w-80 h-96 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPan={onPan}
      onPanStart={onPanStart}
      onPanEnd={onPanEnd}
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
            <motion.div 
                className="w-12 h-2 absolute top-1/2 right-0 -translate-y-1/2 rounded-l-full"
                animate={{ backgroundColor: armColor }}
                transition={{ duration: 0.2 }}
            ></motion.div>
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
            <motion.div 
                className="w-12 h-2 absolute top-1/2 left-0 -translate-y-1/2 rounded-r-full"
                animate={{ backgroundColor: armColor }}
                transition={{ duration: 0.2 }}
            ></motion.div>
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
                 <div className="w-8 h-4 rounded-t-sm border-2 border-black/70 flex items-end justify-center bg-orange-500"><div className="w-4 h-0.5 bg-white/70 rounded-t-sm"></div></div>
                 <div className="w-8 h-4 rounded-t-sm border-2 border-black/70 flex items-end justify-center bg-orange-500"><div className="w-4 h-0.5 bg-white/70 rounded-t-sm"></div></div>
              </div>
         </div>
         
        <motion.div 
          className="w-full h-full shadow-[inset_0_-10px_12px_rgba(0,0,0,0.15),_0_5px_10px_rgba(0,0,0,0.25)] relative overflow-hidden border-4 border-black/70" 
          animate={{ borderRadius: getShapeClipPath(currentShape), backgroundColor: color }}
          transition={{ duration: 0.3 }}
        >
            {tickMarks}
            <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center relative" style={{ borderRadius: getShapeClipPath(currentShape) }}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22/%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5"></div>
            
             <motion.div
                className="absolute top-5 left-5 w-1/2 h-1/4 bg-white/20 rounded-full"
                style={{ filter: 'blur(10px)', transform: 'rotate(-25deg)' }}
              />
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ x: feature_offset_x, y: feature_offset_y }}
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
                        <motion.div className="relative" style={{ height: '2rem' }} variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                          {renderEye(eye_style)}
                          {renderEyebrow(eyebrow_style)}
                        </motion.div>

                        <motion.div className="relative" style={{ height: '2rem' }} variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                          {renderEye(eye_style)}
                          {renderEyebrow(eyebrow_style, true)}
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
                                variants={expressionMouthVariants}
                                animate={expression}
                                transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
                            />
                        </svg>
                    </motion.div>

                    <motion.div
                        className="absolute flex justify-center w-full"
                        style={{ top: '48px', transform: 'translateZ(30px)' }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: show_sunglasses ? 1 : 0, y: show_sunglasses ? 0 : -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="relative">
                            <div className="flex justify-between items-center w-[130px] h-[30px]">
                                <div className="w-[50px] h-full bg-black/60 rounded-xl border border-gray-700"></div>
                                <div className="h-0.5 w-3 border-b border-x border-gray-700 rounded-b-sm self-center"></div>
                                <div className="w-[50px] h-full bg-black/60 rounded-xl border border-gray-700"></div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="absolute flex justify-center w-full"
                        style={{ top: '92px', transform: 'translateZ(25px)', opacity: 0.6 }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: show_mustache ? 0.6 : 0, scale: show_mustache ? 1 : 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg width="60" height="20" viewBox="0 0 100 30">
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


const DesignPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [id, setId] = useState<string | undefined>(undefined);
  const [model, setModel] = useState<ModelType>('emoji');
  const [expression, setExpression] = useState<Expression>('neutral');
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');
  
  const [background_color, setBackgroundColor] = useState('#0a0a0a');
  const [emoji_color, setEmojiColor] = useState('#ffb300');
  const [show_sunglasses, setShowSunglasses] = useState(false);
  const [show_mustache, setShowMustache] = useState(false);
  const [selected_filter, setSelectedFilter] = useState<string | null>(null);
  const [animation_type, setAnimationType] = useState<AnimationType>('random');
  const [isDragging, setIsDragging] = useState(false);
  const [shape, setShape] = useState<ShapeType>('default');
  const [eye_style, setEyeStyle] = useState<FeatureStyle>('default');
  const [mouth_style, setMouthStyle] = useState<FeatureStyle>('default');
  const [eyebrow_style, setEyebrowStyle] = useState<FeatureStyle>('default');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  const defaultBackgroundColor = '#0a0a0a';
  const defaultEmojiColor = '#ffb300';
  const defaultLokiColor = 'orangered';
  
  const dragOrigin = useRef<{ x: number, y: number } | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feature_offset_x = useMotionValue(0);
  const feature_offset_y = useMotionValue(0);
  
  const loadState = (state: EmojiState) => {
    setId(state.id);
    setModel(state.model || 'emoji');
    setExpression(state.expression || 'neutral');
    setBackgroundColor(state.background_color || defaultBackgroundColor);
    setEmojiColor(state.emoji_color || (state.model === 'loki' ? defaultLokiColor : defaultEmojiColor));
    setShowSunglasses(state.show_sunglasses || false);
    setShowMustache(state.show_mustache || false);
    setSelectedFilter(state.selected_filter || null);
    setAnimationType(state.animation_type || 'random');
    setShape(state.shape || 'default');
    setEyeStyle(state.eye_style || 'default');
    setMouthStyle(state.mouth_style || 'default');
    setEyebrowStyle(state.eyebrow_style || 'default');
    feature_offset_x.set(state.feature_offset_x || 0);
    feature_offset_y.set(state.feature_offset_y || 0);
  };

  const handleLoadEmoji = (emojiState: EmojiState) => {
    loadState(emojiState);
    setActiveMenu('main');
  };
  
  useEffect(() => {
    const fetchAndLoadEmoji = async (emojiId: string) => {
      try {
        const { data, error } = await supabase
          .from('emojis')
          .select('*, user:users(*)')
          .eq('id', emojiId)
          .single();

        if (error) throw error;

        if (data) {
          // The data from the DB is the emoji state
          handleLoadEmoji(data as EmojiState);
        } else {
          handleReset();
        }
      } catch (error) {
        console.error("Failed to load emoji from Supabase", error);
        toast({
          title: "Error loading emoji",
          description: "Could not find or load the requested emoji.",
          variant: "destructive",
        });
        handleReset();
      }
    };

    const emojiId = searchParams.get('emojiId');
    if (emojiId) {
      fetchAndLoadEmoji(emojiId);
    } else {
      handleReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]);

  
  const handleReset = () => {
    router.push('/design', { scroll: false });
    setId(undefined);
    setModel('emoji');
    setExpression('neutral');
    setBackgroundColor(defaultBackgroundColor);
    setEmojiColor(defaultEmojiColor);
    setShowSunglasses(false);
    setShowMustache(false);
    setSelectedFilter(null);
    setAnimationType('random');
    setShape('default');
    setEyeStyle('default');
    setMouthStyle('default');
    setEyebrowStyle('default');
    feature_offset_x.set(0);
    feature_offset_y.set(0);
    setActiveMenu('main');
  };
  
  const handleRandomize = () => {
    const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];
    const newExpression = allExpressions[Math.floor(Math.random() * allExpressions.length)];
    setExpression(newExpression);
  }

  const handleSave = () => {
    if (!user) {
        toast({
            title: "Please sign in to save.",
            variant: "destructive",
        });
        return;
    }
    setShowSaveConfirm(true);
  };
  
  const confirmSave = async () => {
    if (!user) return;

    let currentShape = shape;
    if (model === 'loki' && shape === 'blob') {
        currentShape = 'default';
    }

    const currentState: Omit<EmojiState, 'id' | 'user' | 'created_at'> & { user_id: string; id?: string } = {
      user_id: user.id,
      model,
      expression,
      background_color,
      emoji_color,
      show_sunglasses,
      show_mustache,
      selected_filter,
      animation_type,
      shape: currentShape,
      eye_style,
      mouth_style,
      eyebrow_style,
      feature_offset_x: feature_offset_x.get(),
      feature_offset_y: feature_offset_y.get(),
    };
    
    // if there is an id, add it to the state
    if(id) {
        currentState.id = id;
    }


    try {
        const { data, error } = await supabase
            .from('emojis')
            .upsert(currentState) // upsert will insert or update
            .select()
            .single();

        if (error) throw error;
        
        toast({
            title: "Your emoji has been saved.",
            variant: "success",
        });
        // Update the id in case it was a new insert, and update URL
        if (data) {
          setId(data.id);
          router.push(`/design?emojiId=${data.id}`, { scroll: false });
        }
    } catch (error: any) {
        console.error("Failed to save state to Supabase", error);
        toast({
            title: "Failed to save emoji.",
            description: error.message || "There was an error while trying to save your creation.",
            variant: "destructive",
        });
    }
    setShowSaveConfirm(false);
  };


  const handlePanStart = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    setIsDragging(true);
    dragOrigin.current = { x: feature_offset_x.get(), y: feature_offset_y.get() };
  };

  const handlePan = (_: any, info: any) => {
    if (dragOrigin.current) {
        const boundaryX = model === 'emoji' ? 80 : 40; 
        const boundaryY = model === 'emoji' ? 60 : 30;
        
        let newX = dragOrigin.current.x + info.offset.x;
        let newY = dragOrigin.current.y + info.offset.y;

        if ((newX**2 / boundaryX**2) + (newY**2 / boundaryY**2) > 1) {
            const angle = Math.atan2(newY, newX);
            const a = boundaryX;
            const b = boundaryY;
            newX = a * b / Math.sqrt(b**2 + a**2 * Math.tan(angle)**2) * (newX > 0 ? 1 : -1);
            newY = newX * Math.tan(angle);
        }

        feature_offset_x.set(newX);
        feature_offset_y.set(newY);
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
    if (selected_filter === filterName) {
      setSelectedFilter(null); // Deselect
    } else {
      setSelectedFilter(filterName);
    }
  };

  const handleExpressionToggle = (newExpression: Expression) => {
    setExpression(newExpression);
  };
  
  const handleShapeToggle = (newShape: ShapeType) => {
    if (shape === newShape) {
      setShape('default');
    } else {
      setShape(newShape);
    }
  };

  const handleFeatureSelect = (
    type: 'eye' | 'mouth' | 'eyebrow', 
    style: FeatureStyle
  ) => {
    if (type === 'eye') {
        setEyeStyle(prev => prev === style ? 'default' : style);
    } else if (type === 'mouth') {
        setMouthStyle(prev => prev === style ? 'default' : style);
    } else {
        setEyebrowStyle(prev => prev === style ? 'default' : style);
    }
  };

  const renderFeatureMenu = (
    type: 'eye' | 'mouth' | 'eyebrow', 
    currentStyle: FeatureStyle
  ) => {
    const featureStyles: {name: FeatureStyle, label: string}[] = [
        {name: 'male-1', label: 'Style 1'},
        {name: 'male-2', label: 'Style 2'},
        {name: 'male-3', label: 'Style 3'},
        {name: 'female-1', label: 'Style 4'},
        {name: 'female-2', label: 'Style 5'},
        {name: 'female-3', label: 'Style 6'},
    ];

    const title = type.charAt(0).toUpperCase() + type.slice(1);

    return (
        <div className="flex items-center w-full">
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('face')} className="flex-shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2 flex-shrink-0" />
            <span className="font-semibold text-sm mr-4">{title}</span>
             <div className="flex-1 flex items-center gap-2 overflow-x-auto pr-4">
                {featureStyles.map(style => (
                    <Tooltip key={style.name}>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={currentStyle === style.name ? 'default' : 'outline'}
                                onClick={() => handleFeatureSelect(type, style.name)}
                            >
                                {style.label}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{style.label}</p></TooltipContent>
                    </Tooltip>
                ))}
             </div>
        </div>
    )
  }
  
  const handleModelChange = (newModel: ModelType) => {
    if (model === newModel) return;
    setModel(newModel);
    
    if (newModel === 'loki') {
        setEmojiColor(defaultLokiColor);
        if (shape === 'blob') {
            setShape('default');
        }
    } else {
        setEmojiColor(defaultEmojiColor);
    }
  }

  const renderMenu = () => {
    const isLoki = model === 'loki';
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
        const shapes: { name: ShapeType; label: string }[] = isLoki 
        ? [
            { name: 'default', label: 'Default' },
            { name: 'square', label: 'Square' },
            { name: 'squircle', label: 'Squircle' },
            { name: 'tear', label: 'Tear' },
        ]
        : [
          { name: 'default', label: 'Default' },
          { name: 'square', label: 'Square' },
          { name: 'squircle', label: 'Squircle' },
          { name: 'tear', label: 'Tear' },
          { name: 'blob', label: 'Blob' },
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
                        <Input id="bg-color-input" type="color" value={background_color} onChange={(e) => setBackgroundColor(e.target.value)} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Background Color</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="face-color-input" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}))}>
                        <Pipette className="h-4 w-4"/>
                        <Input id="face-color-input" type="color" value={emoji_color} onChange={(e) => setEmojiColor(e.target.value)} className="sr-only" />
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
                    <Label htmlFor="sunglasses-switch" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}), "flex items-center gap-2 cursor-pointer", show_sunglasses && "bg-accent text-accent-foreground")}>
                        <Glasses className="h-4 w-4" />
                        <Switch id="sunglasses-switch" checked={show_sunglasses} onCheckedChange={setShowSunglasses} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Toggle Sunglasses</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="mustache-switch" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}), "flex items-center gap-2 cursor-pointer", show_mustache && "bg-accent text-accent-foreground")}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.25,12.05c0,5.65-4.14,7.2-9.25,7.2S3.75,17.7,3.75,12.05c0-4.06,2.23-5.23,3.73-6.23C8.5,5,9.5,2,13,2s4.5,3,5.5,3.82C20,6.82,22.25,7.99,22.25,12.05Z"/></svg>
                        <Switch id="mustache-switch" checked={show_mustache} onCheckedChange={setShowMustache} className="sr-only" />
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
                                        selected_filter === filter.name ? 'border-primary scale-110' : 'border-border'
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
                                        variant={animation_type === name ? 'default' : 'outline'}
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
      case 'face':
        return (
            <>
                <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button variant="ghost" onClick={() => setActiveMenu('eyes')}><Eye className="mr-2 h-4 w-4" /> Eyes</Button>
                <Button variant="ghost" onClick={() => setActiveMenu('mouth')}><Meh className="mr-2 h-4 w-4" /> Mouth</Button>
                <Button variant="ghost" onClick={() => setActiveMenu('eyebrows')}><ChevronsRight className="mr-2 h-4 w-4" style={{transform: 'rotate(-45deg)'}} /> Eyebrows</Button>
            </>
        )
      case 'eyes':
        return renderFeatureMenu('eye', eye_style);
      case 'mouth':
        return renderFeatureMenu('mouth', mouth_style);
      case 'eyebrows':
        return renderFeatureMenu('eyebrow', eyebrow_style);
      default: // 'main'
        return (
          <>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                <span className="text-xs mt-1">New</span>
            </Button>
             <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={handleSave}>
                <Save className="h-4 w-4" />
                <span className="text-xs mt-1">Save</span>
            </Button>
            <Separator orientation="vertical" className="h-full mx-1" />
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('expressions')}>
                <Smile className="h-4 w-4" />
                <span className="text-xs mt-1">Expressions</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('face')}>
                <UserIcon className="h-4 w-4" />
                <span className="text-xs mt-1">Face</span>
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
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('accessories')} disabled={model === 'loki'}>
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
    <TooltipProvider>
      <div 
          className="flex h-full w-full flex-col overflow-hidden touch-none transition-colors duration-300"
          style={{ backgroundColor: background_color }}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative">
          {/* Model Switcher */}
          <div className="absolute top-4 right-4 z-20 bg-background/50 backdrop-blur-sm p-1 rounded-lg flex items-center gap-1">
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button 
                          size="icon" 
                          variant={model === 'emoji' ? 'secondary' : 'ghost'}
                          onClick={() => handleModelChange('emoji')}
                      >
                          <Users className="h-5 w-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Emoji Model</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button 
                          size="icon" 
                          variant={model === 'loki' ? 'secondary' : 'ghost'}
                          onClick={() => handleModelChange('loki')}
                      >
                          <Clock className="h-5 w-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Loki Clock Model</p></TooltipContent>
              </Tooltip>
          </div>
          
          <motion.div
            className="w-80 h-96 flex items-center justify-center select-none"
            style={{ 
              transformStyle: 'preserve-3d',
              filter: selected_filter && selected_filter !== 'None' ? `${selected_filter.toLowerCase().replace('-', '')}(1)` : 'none',
            }}
          >
            {model === 'emoji' ? (
                <Face 
                    expression={expression} 
                    color={emoji_color} 
                    setColor={setEmojiColor}
                    show_sunglasses={show_sunglasses} 
                    show_mustache={show_mustache} 
                    shape={shape}
                    eye_style={eye_style}
                    mouth_style={mouth_style}
                    eyebrow_style={eyebrow_style}
                    animation_type={animation_type}
                    isDragging={isDragging}
                    onPan={handlePan}
                    onPanStart={handlePanStart}
                    onPanEnd={handlePanEnd}
                    feature_offset_x={feature_offset_x}
                    feature_offset_y={feature_offset_y}
                />
            ) : (
                <ClockFace 
                    expression={expression} 
                    color={emoji_color} 
                    setColor={setEmojiColor}
                    show_sunglasses={show_sunglasses} 
                    show_mustache={show_mustache} 
                    shape={shape}
                    eye_style={eye_style}
                    mouth_style={mouth_style}
                    eyebrow_style={eyebrow_style}
                    animation_type={animation_type}
                    isDragging={isDragging}
                    isInteractive={true}
                    onPan={handlePan}
                    onPanStart={handlePanStart}
                    onPanEnd={handlePanEnd}
                    feature_offset_x={feature_offset_x}
                    feature_offset_y={feature_offset_y}
                />
            )}
          </motion.div>
        </div>

        <div className="fixed bottom-[56px] left-0 right-0 z-20">
              <ScrollArea className="w-full whitespace-nowrap bg-background/80 backdrop-blur-sm border-t border-border no-scrollbar">
                  <div className="flex items-center justify-center w-max space-x-1 p-2 mx-auto h-16">
                      {renderMenu()}
                  </div>
                  <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
        </div>
        
        <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Emoji</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to save this emoji to your gallery?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave}>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

export default function DesignPage() {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <DesignPageContent />
      </React.Suspense>
    );
}



    

    
