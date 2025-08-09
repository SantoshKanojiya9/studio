
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
    neutral: { d: "M20,50 C40,45 60,45 80,50" },
    happy:   { d: "M20,45 C40,35 60,35 80,45" },
    angry:   { d: "M20,55 L80,45" },
    sad:     { d: "M20,50 C40,60 60,60 80,50" },
    surprised: { d: "M20,45 C40,40 60,40 80,45" },
    scared:  { d: "M20,50 C40,55 60,55 80,50" },
    love:    { d: "M20,45 C40,35 60,35 80,45" },
  };

  const mouthVariants = {
    neutral: { d: "M40,65 Q50,65 60,65", opacity: 0, scale: 0.8 },
    happy: { d: "M40,65 Q50,75 60,65", opacity: 0, scale: 1 },
    angry: { d: "M40,70 Q50,60 60,70", opacity: 0, scale: 1 },
    sad: { d: "M40,70 Q50,80 60,70", opacity: 1, scale: 1 },
    surprised: { d: "M45,70 Q50,75 55,70 A 5 5 0 0 1 45 70", opacity: 1, scale: 1 },
    scared: { d: "M40,65 Q50,75 60,65 A 10 10 0 0 1 40 65", opacity: 1, scale: 1 },
    love: { d: "M40,65 Q50,75 60,65", opacity: 0, scale: 1 },
  };

  const blushVariants = {
    neutral: { opacity: 0 },
    happy: { opacity: 0.8 },
    angry: { opacity: 0 },
    sad: { opacity: 0.8 },
    surprised: { opacity: 0 },
    scared: { opacity: 0 },
    love: { opacity: 0.8 },
  }

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
                    <motion.div className="flex justify-between w-48 absolute top-[155px]"
                        variants={blushVariants}
                        animate={expression}
                        transition={{ duration: 0.3, type: "spring" }}
                    >
                        <div className="w-10 h-5 bg-pink-300/80 rounded-full" style={{ filter: 'blur(2px)'}} />
                        <div className="w-10 h-5 bg-pink-300/80 rounded-full" style={{ filter: 'blur(2px)'}} />
                    </motion.div>

                    <svg width="180" height="180" viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-2">
                        {/* Eyes */}
                        <motion.path
                            fill="transparent"
                            stroke="black"
                            strokeWidth={3}
                            strokeLinecap="round"
                            variants={eyeVariants}
                            animate={expression}
                            transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 15 }}
                            style={{ transform: 'translateX(0px) translateY(5px)' }}
                        />
                         <motion.path
                            fill="transparent"
                            stroke="black"
                            strokeWidth={3}
                            strokeLinecap="round"
                            variants={eyeVariants}
                            animate={expression}
                            transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 15 }}
                            style={{ transform: 'translateX(30px) translateY(5px) scaleX(-1)' }}
                        />
                        {/* Mouth */}
                        <motion.path
                            fill="transparent"
                            stroke="black"
                            strokeWidth={2}
                            strokeLinecap="round"
                            variants={mouthVariants}
                            animate={expression}
                            transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
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
