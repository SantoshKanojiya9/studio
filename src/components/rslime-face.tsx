
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate, MotionValue } from 'framer-motion';
import type { Expression, ShapeType, FeatureStyle, AnimationType } from '@/app/design/page';

export const RimuruFace = ({ 
    expression: initialExpression, 
    color,
    setColor,
    show_sunglasses, 
    show_mustache,
    shape,
    eye_style,
    mouth_style,
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
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
  const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);

  const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];

  useEffect(() => {
    setExpression(initialExpression);
  }, [initialExpression]);

  // Animation effect
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

    stopAnimations();

    switch (animation_type) {
        case 'left-right':
            animationControlsX.current = animate(feature_offset_x, [-60, 60], animationOptions);
            break;
        case 'up-down':
            animationControlsY.current = animate(feature_offset_y, [-50, 50], animationOptions);
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
    // Happy, content face from reference
    love:    { left: "M 25,58 C 35,62 50,62 60,58", right: "M 90,55 C 100,59 115,59 125,55" },
    // > < expression
    happy:   { left: "M 35 55 L 50 65 L 35 75", right: "M 115 55 L 100 65 L 115 75" },
    // Angry face from reference: \ /
    angry:   { left: "M 25,55 L 60,65", right: "M 90,65 L 125,55" },
    // Sad face from reference
    sad:     { left: "M 25,65 C 35,72 50,72 60,65", right: "M 90,65 C 100,72 115,72 125,65" },
    // Surprised face from reference
    surprised: { left: "M 25,55 C 42.5,45 60,55 60,55", right: "M 90,55 C 107.5,45 125,55 125,55" },
    // Neutral face from reference: – –
    neutral: { left: "M 25,60 L 60,60", right: "M 90,60 L 125,60" },
    // Scared face
    scared: { left: "M 25,65 C 35,55 50,55 60,65", right: "M 90,65 C 100,55 115,55 125,65" },
  };

  const mouthVariants = {
    love:    { d: "M 60,82 C 70,87 80,87 90,82" },
    happy:   { d: "M 70,85 C 75,95 85,95 90,85" },
    angry:   { d: "M 60,85 L 90,85" },
    sad:     { d: "M 65,90 L 85,90" },
    surprised: { d: "M 65, 82 A 10 10 0 0 1 85, 82 A 10 10 0 0 1 65 82 Z" },
    neutral: { d: "M 70,85 L 80,85" },
    scared: { d: "M 60, 90 C 70,80 80,80 90,90" },
  };

  const blushVariants = {
    love: { opacity: 0.7, scale: 1.1, filter: 'blur(1px)' },
    happy: { opacity: 0.8 },
    neutral: { opacity: 0.8 },
    angry: { opacity: 0 },
    sad: { opacity: 0.8 },
    surprised: { opacity: 0 },
    scared: { opacity: 0 },
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
  
  return (
    <motion.div 
      className="relative w-80 h-96 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
      onPan={isInteractive ? onPan : undefined}
      onPanStart={isInteractive ? onPanStart : undefined}
      onPanEnd={isInteractive ? onPanEnd : undefined}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div 
        className="absolute w-full h-64 z-10 flex items-center justify-center"
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div 
          className="w-full h-full relative"
          animate={{ borderRadius: getShapeClipPath(shape) }}
          transition={{ duration: 0.3 }}
        >
            <motion.div 
                className="w-full h-full flex items-center justify-center relative overflow-hidden"
                animate={{ backgroundColor: color, borderRadius: getShapeClipPath(shape) }}
                transition={{ duration: 0.2 }}
            >
                {/* Glossy highlight */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-radial from-white/40 via-white/20 to-transparent rounded-full" />
                <div className="absolute top-4 left-6 w-16 h-8 bg-white/70 rounded-full" style={{ filter: 'blur(10px)', transform: 'rotate(-30deg)' }}></div>
                <div className="absolute top-8 right-8 w-10 h-5 bg-white/50 rounded-full" style={{ filter: 'blur(8px)', transform: 'rotate(20deg)' }}></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5"></div>

                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ x: feature_offset_x, y: feature_offset_y }}
                    transition={{ duration: 1.5, type: 'spring' }}
                >
                    <motion.div 
                        className="flex justify-between w-48 absolute top-[155px]"
                        variants={blushVariants}
                        animate={expression}
                        transition={{ duration: 0.3, type: "spring" }}
                    >
                        <div className="w-10 h-5 bg-pink-300/80 rounded-full" style={{ filter: 'blur(2px)'}} />
                        <div className="w-10 h-5 bg-pink-300/80 rounded-full" style={{ filter: 'blur(2px)'}} />
                    </motion.div>
                
                    <svg width="200" height="200" viewBox="0 0 150 150" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {/* Eyes */}
                        <motion.path
                            d={eyeVariants[expression]?.left}
                            stroke="black"
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeLinecap="round"
                        />
                        <motion.path
                            d={eyeVariants[expression]?.right}
                            stroke="black"
                            strokeWidth="2.5"
                            fill="transparent"
                            strokeLinecap="round"
                        />

                        {/* Mouth */}
                        <motion.path
                           d={mouthVariants[expression]?.d}
                           stroke="black"
                           strokeWidth="2.5"
                           fill="transparent"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        />

                    </svg>
                    
                    {/* Accessories */}
                    <motion.div
                        className="absolute flex justify-center w-full"
                        style={{ top: '100px', transform: 'translateZ(30px)' }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: show_sunglasses ? 1 : 0, y: show_sunglasses ? 0 : -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                         <div className="relative">
                            <div className="flex justify-between items-center w-[160px] h-[40px]">
                                <div className="w-[60px] h-full bg-black/70 rounded-xl border-2 border-gray-600"></div>
                                <div className="h-1 w-4 border-b-2 border-x-2 border-gray-600 rounded-b-sm self-center"></div>
                                <div className="w-[60px] h-full bg-black/70 rounded-xl border-2 border-gray-600"></div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="absolute flex justify-center w-full"
                        style={{ top: '160px', transform: 'translateZ(25px)' }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: show_mustache ? 1 : 0, scale: show_mustache ? 1 : 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg width="80" height="25" viewBox="0 0 100 30">
                            <path d="M 10 15 C 20 -5, 80 -5, 90 15 Q 50 10, 10 15" fill="#4a2c0f" />
                        </svg>
                    </motion.div>

                </motion.div>
            </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
