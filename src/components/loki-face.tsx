
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import type { Expression, ShapeType, FeatureStyle, AnimationType } from '@/app/design/page';

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
    clay_width,
    clay_height,
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
    clay_width?: number;
    clay_height?: number;
}) => {
  const [expression, setExpression] = useState<Expression>(initialExpression);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [isAngryMode, setIsAngryMode] = useState(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  
  const nonAngryExpressions: Expression[] = ['neutral', 'happy', 'sad', 'surprised', 'scared', 'love'];

  // Refs for managing animations must be at the top level
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
  const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (!isAngryMode) {
      setExpression(initialExpression);
    }
  }, [initialExpression, isAngryMode]);
  
  // Dedicated effect for animations
  useEffect(() => {
    const stopAnimations = () => {
      if (animationControlsX.current) animationControlsX.current.stop();
      if (animationControlsY.current) animationControlsY.current.stop();
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };

    if (isDragging || animation_type === 'none') {
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

    stopAnimations();

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
            animationControlsY.current = animate(feature_offset_y, [25, 25], animationOptions);
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
            randomAnimation();
            animationIntervalRef.current = setInterval(randomAnimation, 3000);
            break;
        default:
            // 'none' or other cases
    }

    return stopAnimations;
  }, [animation_type, isDragging, feature_offset_x, feature_offset_y]);


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
      clay: '50%', // clay not supported for loki, will default
      sphere: '50%',
      blob: '40% 60% 40% 60% / 60% 40% 60% 40%',
    };
    return paths[s] || paths.default;
  };
  
  // Ensure blob shape is not used for loki
  const currentShape = shape === 'clay' ? 'default' : shape;

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
    const eyeBaseChildren = (
        <motion.div 
            className="absolute top-1/2 left-1/2 w-5 h-5 bg-black rounded-full"
            style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%', scale: pupilScale }}
        >
            <motion.div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
            <motion.div className="flex items-center justify-center w-full h-full" animate={{ opacity: expression === 'love' ? 1 : 0 }} transition={{ duration: 0.1 }}>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
        </motion.div>
    );

    const eyeBase = (
      <div className="w-8 h-full bg-white rounded-t-full rounded-b-md relative overflow-hidden border-2 border-black/70">
        {eyeBaseChildren}
      </div>
    );

    // Clock model has a more fixed eye structure but we can still adapt
    switch (style) {
      case 'male-1': return <div className="w-8 h-full bg-white rounded-lg relative overflow-hidden border-2 border-black/70">{eyeBaseChildren}</div>;
      case 'male-2': return <div className="w-8 h-full bg-white rounded-t-lg relative overflow-hidden border-2 border-black/70">{eyeBaseChildren}</div>;
      case 'female-1': return <div className="w-8 h-full bg-white rounded-full relative overflow-hidden border-2 border-black/70">{eyeBaseChildren}</div>;
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

    const defaultEyebrow = <motion.div className="absolute -top-1.5 left-0.5 w-7 h-2.5 bg-black/80" style={{ ...baseStyle, clipPath: 'path("M0,6 C6,0, 22,0, 28,6")' }} {...eyebrowMotion} />;

    switch (style) {
      case 'male-1': return <motion.div className="absolute -top-1.5 left-0 w-7 h-2 bg-black/80" style={{ ...baseStyle, clipPath: 'polygon(0 0, 100% 20%, 90% 100%, 10% 100%)' }} {...eyebrowMotion} />;
      case 'male-2': return <motion.div className="absolute -top-2 left-0 w-7 h-2.5 bg-black/80" style={{ ...baseStyle, borderRadius: '2px' }} {...eyebrowMotion} />;
      case 'male-3': return <motion.div className="absolute -top-1 left-0 w-7 h-1.5 bg-black/80" style={baseStyle} {...eyebrowMotion} />;
      case 'female-1': return <motion.div className="absolute -top-2 left-0 w-7 h-2 bg-black/80" style={{ ...baseStyle, clipPath: 'path("M0,6 C6,0, 22,0, 28,6")' }} {...eyebrowMotion} />;
      case 'female-2': return <motion.div className="absolute -top-1.5 left-0 w-7 h-1.5 bg-black/80" style={{ ...baseStyle }} {...eyebrowMotion} />;
      case 'female-3': return <motion.div className="absolute -top-2 left-0 w-7 h-2 bg-black/70" style={{ ...baseStyle, clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)' }} {...eyebrowMotion} />;
      default: return defaultEyebrow;
    }
  };


  return (
    <motion.div 
      className="relative w-80 h-96 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
      onPointerMove={isInteractive ? handlePointerMove : undefined}
      onPointerLeave={isInteractive ? handlePointerLeave : undefined}
      onPan={isInteractive ? onPan : undefined}
      onPanStart={isInteractive ? onPanStart : undefined}
      onPanEnd={isInteractive ? onPanEnd : undefined}
      onTap={isInteractive ? handleTap : undefined}
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
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.8%22%20numOctaves%3D%222%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5"></div>
            
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
                        animate={{ opacity: 0, y: -20 }}
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
                        animate={{ opacity: 0, scale: 0.5 }}
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
