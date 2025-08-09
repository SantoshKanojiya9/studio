
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
    neutral:   { d: "M 20,50 C 30,55 50,55 60,50" },
    happy:     { d: "M 20,50 C 30,55 50,55 60,50" }, // Same as neutral but with blush
    love:      { d: "M 20,50 C 30,55 50,55 60,50" }, // Same as happy but with blush lines
    angry:     { d: "M 25,45 L 55,60" }, // For the '\' eye
    sad:       { d: "M 20,55 C 30,50 50,50 60,55" },
    surprised: { d: "M 20,45 C 30,40 50,40 60,45" },
    scared:    { d: "M 20,45 C 30,35 50,35 60,45" },
  };
  
  const mouthVariants = {
    neutral: { d: "", opacity: 0 },
    happy: { d: "", opacity: 0 },
    love: { d: "", opacity: 0 },
    angry: { d: "", opacity: 0 },
    sad: { d: "M 45,65 L 50,70 L 55,65", opacity: 1 },
    surprised: { d: "M 40,65 C 50,75 60,65", opacity: 1 },
    scared: { d: "M 40,70 Q 50,60 60,70", opacity: 1 },
  };

  const blushVariants = {
    neutral: { opacity: 0 },
    happy: { opacity: 0.8 },
    love: { opacity: 0.8 },
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
        blob: '50% 50% 40% 40% / 60% 60% 40% 40%',
    };
    return paths[s] || paths.default;
  };
  
  const currentShape = shape === 'blob' ? 'default' : shape;

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
          animate={{ borderRadius: getShapeClipPath(currentShape) }}
          transition={{ duration: 0.3 }}
        >
            <motion.div
                className="w-full h-full flex items-center justify-center relative overflow-hidden"
                animate={{ backgroundColor: color, borderRadius: getShapeClipPath(currentShape) }}
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
                    <motion.div className="flex justify-between w-48 absolute top-[140px]"
                        variants={blushVariants}
                        animate={expression}
                        transition={{ duration: 0.3, type: "spring" }}
                    >
                        <div className="relative w-12 h-6">
                            <div className="w-full h-full bg-pink-300/80 rounded-full" style={{ filter: 'blur(1px)'}} />
                             {expression === 'love' && (
                                <div className="absolute inset-0 flex justify-center items-center gap-1">
                                    <div className="w-px h-3 bg-black/70 transform rotate-[-15deg]"></div>
                                    <div className="w-px h-3 bg-black/70"></div>
                                    <div className="w-px h-3 bg-black/70 transform rotate-[15deg]"></div>
                                </div>
                            )}
                        </div>
                         <div className="relative w-12 h-6">
                            <div className="w-full h-full bg-pink-300/80 rounded-full" style={{ filter: 'blur(1px)'}} />
                            {expression === 'love' && (
                                <div className="absolute inset-0 flex justify-center items-center gap-1">
                                    <div className="w-px h-3 bg-black/70 transform rotate-[-15deg]"></div>
                                    <div className="w-px h-3 bg-black/70"></div>
                                    <div className="w-px h-3 bg-black/70 transform rotate-[15deg]"></div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                
                    <svg width="200" height="200" viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-5">
                        {/* Left Eye */}
                        <motion.path
                            fill="transparent"
                            stroke="black"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            variants={eyeVariants}
                            animate={expression}
                            transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 15 }}
                            style={{ transform: expression === 'angry' ? 'translateX(-15px)' : 'translateX(-20px)' }}
                        />
                         {/* Right Eye */}
                         <motion.path
                            fill="transparent"
                            stroke="black"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            variants={eyeVariants}
                            animate={expression}
                            transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 15 }}
                            style={{ transform: expression === 'angry' ? 'translateX(15px) scaleX(-1)' : 'translateX(20px) scaleX(-1)' }}
                        />

                        {/* Mouth */}
                        <motion.path
                           fill="transparent"
                           stroke="black"
                           strokeWidth={1.5}
                           strokeLinecap="round"
                           variants={mouthVariants}
                           animate={expression}
                           transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
                        />
                    </svg>

                </motion.div>
            </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
