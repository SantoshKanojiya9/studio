
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate, MotionValue } from 'framer-motion';
import { Heart } from 'lucide-react';
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

  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
  const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);

  const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];

  useEffect(() => {
    setExpression(initialExpression);
  }, [initialExpression]);

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

    // Stop any existing animations before starting new ones
    stopAnimations();

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
            randomAnimation();
            animationIntervalRef.current = setInterval(randomAnimation, 3000);
            break;
        default:
             // 'none' or other cases, do nothing
    }

    // Cleanup function to stop animations when the component unmounts or dependencies change
    return stopAnimations;
  }, [animation_type, isDragging, feature_offset_x, feature_offset_y]);


  const eyeVariants = {
    // Happy, content face from reference
    love:    { left: "M 25,58 C 35,62 50,62 60,58", right: "M 90,55 C 100,59 115,59 125,55" },
    // > < expression
    happy:   { left: "M 25 55 L 60 65", right: "M 90 65 L 125 55" },
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
    love:    { d: "M 65,82 C 75,87 85,87 95,82" },
    happy:   { d: "M 65,82 C 75,92 85,92 95,82" },
    angry:   { d: "M 65,85 L 95,85" },
    sad:     { d: "M 70,90 L 90,90" },
    surprised: { d: "M 70, 82 A 10 10 0 0 1 90, 82 A 10 10 0 0 1 70 82 Z" },
    neutral: { d: "M 75,85 L 85,85" },
    scared: { d: "M 65, 90 C 75,80 85,80 95,90" },
  };
  
    const blushVariants = {
        love: { opacity: 1 },
        happy: { opacity: 0 },
        neutral: { opacity: 0 },
        angry: { opacity: 0 },
        sad: { opacity: 0 },
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
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-radial from-white/40 via-white/20 to-transparent rounded-full" />
                <div className="absolute top-4 left-6 w-16 h-8 bg-white/70 rounded-full" style={{ filter: 'blur(10px)', transform: 'rotate(-30deg)' }}></div>
                <div className="absolute top-8 right-8 w-10 h-5 bg-white/50 rounded-full" style={{ filter: 'blur(8px)', transform: 'rotate(20deg)' }}></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5"></div>

                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ x: feature_offset_x, y: feature_offset_y }}
                    transition={{ duration: 1.5, type: 'spring' }}
                >
                    <svg width="200" height="200" viewBox="0 0 150 150" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                       <defs>
                          <filter id="blush-blur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                          </filter>
                        </defs>

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
                         {/* Blush */}
                        <motion.g
                            variants={blushVariants}
                            animate={expression}
                            transition={{ duration: 0.3, type: "spring" }}
                        >
                            <ellipse cx="42" cy="78" rx="15" ry="8" fill="#FF69B4" filter="url(#blush-blur)" />
                            <ellipse cx="108" cy="78" rx="15" ry="8" fill="#FF69B4" filter="url(#blush-blur)" />
                        </motion.g>

                    </svg>
                </motion.div>
            </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
