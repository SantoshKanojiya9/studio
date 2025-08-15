
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, MotionValue, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Expression, ShapeType, FeatureStyle, AnimationType } from '@/app/design/page';

// Re-implementing necessary parts from Face component to be self-contained.
const renderEye = (style: FeatureStyle, pupilX: MotionValue<number>, pupilY: MotionValue<number>, pupilScale: MotionValue<number>, expression: Expression) => {
    const eyeBaseChildren = (
      <>
        <motion.div
          className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full"
          style={{ x: pupilX, y: pupilY, translateX: '-50%', translateY: '-50%', scale: pupilScale }}
        >
          <motion.div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
          <motion.div className="flex items-center justify-center w-full h-full" animate={{ opacity: expression === 'love' ? 1 : 0 }} transition={{ duration: 0.1 }}>
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </motion.div>
        </motion.div>
      </>
    );

    const eyeBase = (
      <div className="w-12 h-10 bg-white rounded-full relative overflow-hidden">
        {eyeBaseChildren}
      </div>
    );

    switch (style) {
      case 'male-1': return <div className="w-12 h-8 bg-white rounded-lg relative overflow-hidden">{eyeBaseChildren}</div>;
      case 'male-2': return <div className="w-12 h-10 bg-white rounded-t-full relative overflow-hidden">{eyeBaseChildren}</div>;
      case 'male-3': return <div className="w-10 h-10 bg-white rounded-md relative overflow-hidden">{eyeBaseChildren}</div>;
      case 'female-1': return <div className="w-12 h-10 bg-white rounded-full relative overflow-hidden border-2 border-black"><div className="absolute -top-1 right-0 w-4 h-4 bg-white" style={{clipPath:'polygon(0 0, 100% 0, 100% 100%)'}}/>{eyeBaseChildren}</div>;
      case 'female-2': return <div className="w-12 h-12 bg-white rounded-full relative overflow-hidden flex items-center justify-center">{eyeBaseChildren}</div>;
      case 'female-3': return <div className="w-14 h-8 bg-white rounded-tl-2xl rounded-br-2xl relative overflow-hidden">{eyeBaseChildren}</div>;
      default: return eyeBase;
    }
  };

  const renderEyebrow = (style: FeatureStyle, expression: Expression, eyebrowVariants: any, isRight?: boolean) => {
    const baseStyle: React.CSSProperties = {
      transformOrigin: 'center',
      transform: isRight ? 'scaleX(-1)' : 'none',
    };
    const eyebrowMotion = {
        variants: eyebrowVariants,
        animate: expression,
        transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 15 }
    };

    const defaultEyebrow = <motion.div className="absolute -top-3 left-0 w-12 h-4 bg-black" style={{ ...baseStyle, clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }} {...eyebrowMotion} />;

    switch (style) {
      case 'male-1': return <motion.div className="absolute -top-3 left-0 w-14 h-4 bg-black" style={{ ...baseStyle, clipPath: 'polygon(0 0, 100% 20%, 90% 100%, 10% 100%)' }} {...eyebrowMotion} />;
      case 'male-2': return <motion.div className="absolute -top-4 left-0 w-12 h-5 bg-black" style={{ ...baseStyle, borderRadius: '4px' }} {...eyebrowMotion} />;
      case 'male-3': return <motion.div className="absolute -top-2 left-0 w-12 h-3 bg-black" style={baseStyle} {...eyebrowMotion} />;
      case 'female-1': return <motion.div className="absolute -top-4 left-0 w-12 h-3 bg-black" style={{ ...baseStyle, clipPath: 'path("M0,10 C10,0 40,0 50,10")' }} {...eyebrowMotion} />;
      case 'female-2': return <motion.div className="absolute -top-3 left-0 w-12 h-2.5 bg-black" style={{ ...baseStyle }} {...eyebrowMotion} />;
      case 'female-3': return <motion.div className="absolute -top-3 left-0 w-12 h-4 bg-black/80" style={{ ...baseStyle, clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)' }} {...eyebrowMotion} />;
      default: return defaultEyebrow;
    }
  };


type CreatorMojiProps = {
    expression: Expression;
    show_sunglasses: boolean;
    show_mustache: boolean;
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
    color: string;
    setColor: (color: string) => void;
    clay_width: number;
    clay_height: number;
};

export const CreatorMoji = (props: CreatorMojiProps) => {

    const { expression: initialExpression, isDragging, animation_type, feature_offset_x, feature_offset_y, shape, color } = props;
    
    const [expression, setExpression] = useState<Expression>(initialExpression);
    const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationControlsX = useRef<ReturnType<typeof animate> | null>(null);
    const animationControlsY = useRef<ReturnType<typeof animate> | null>(null);
    const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];

    const pointerX = useMotionValue(0.5);
    const pointerY = useMotionValue(0.5);

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
            } while ((newX ** 2 / boundaryX ** 2) + (newY ** 2 / boundaryY ** 2) > 1);

            animate(feature_offset_x, newX, { type: 'spring', stiffness: 50, damping: 20 });
            animate(feature_offset_y, newY, { type: 'spring', stiffness: 50, damping: 20 });
        };

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
        }

        return stopAnimations;
    }, [animation_type, isDragging, feature_offset_x, feature_offset_y]);


    // Simplified variants for CreatorMoji.
    const eyeVariants = {
        neutral: { y: 0, scaleY: 1 },
        happy: { y: 4, scaleY: 0.8 },
        angry: { y: 2, scaleY: 0.8, rotate: -2 },
        sad: { y: 6, scaleY: 0.9 },
        surprised: { y: -3, scaleY: 1.1 },
        scared: { y: -4, scaleY: 1.2, scaleX: 1.1 },
        love: { y: 2, scaleY: 1 },
    };

    const eyebrowVariants = {
        neutral: { y: 0, rotate: 0 },
        happy: { y: -4, rotate: -5 },
        angry: { y: 4, rotate: 20 },
        sad: { y: 2, rotate: -10 },
        surprised: { y: -6, rotate: 5 },
        scared: { y: -8, rotate: 3 },
        love: { y: -5, rotate: -5 },
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
        neutral: { d: mouthVariants[props.mouth_style]?.d || mouthVariants.default.d, fill: "transparent" },
        happy: { d: "M 30 50 Q 50 75 70 50", fill: "transparent" },
        angry: { d: "M 25 60 Q 50 35 75 60", fill: "transparent" },
        sad: { d: "M 30 60 Q 50 50 70 60", fill: "transparent" },
        surprised: { d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55", fill: "transparent" },
        scared: { d: "M 35 50 Q 50 65 65 50 A 15 15 0 0 1 35 50", fill: "transparent" },
        love: { d: "M 30 50 Q 50 75 70 50", fill: "transparent" },
    };
    
    const smoothPointerX = useSpring(pointerX, { stiffness: 300, damping: 20, mass: 0.5 });
    const smoothPointerY = useSpring(pointerY, { stiffness: 300, damping: 20, mass: 0.5 });
    
    const pupilXFromPointer = useTransform(smoothPointerX, [0, 1], [-12, 12]);
    const pupilYFromPointer = useTransform(smoothPointerY, [0, 1], [-8, 8]);
    
    const pupilX = useTransform(() => pupilXFromPointer.get() + feature_offset_x.get() * 0.2);
    const pupilY = useTransform(() => pupilYFromPointer.get() + feature_offset_y.get() * 0.2);
  
    const pupilScale = useSpring(expression === 'scared' ? 0.6 : 1, { stiffness: 400, damping: 20 });

    const getShapeClipPath = (s: ShapeType) => {
        const paths: Record<ShapeType, string> = {
            default: '50% 50% 40% 40% / 60% 60% 40% 40%',
            sphere: '50%',
            square: '10%',
            squircle: '30%',
            tear: '50% 50% 50% 50% / 60% 60% 40% 40%',
            clay: '40% 60% 40% 60% / 60% 40% 60% 40%',
            blob: '40% 60% 40% 60% / 60% 40% 60% 40%',
        };
        return paths[s] || paths.default;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!props.isInteractive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        pointerX.set(x);
        pointerY.set(y);
    };
    
    const handlePointerLeave = () => {
        if (!props.isInteractive) return;
        pointerX.set(0.5);
        pointerY.set(0.5);
    };

    return (
        <motion.div 
            className="relative w-80 h-96 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ 
                transformStyle: 'preserve-3d' 
            }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPan={props.isInteractive ? props.onPan : undefined}
            onPanStart={props.isInteractive ? props.onPanStart : undefined}
            onPanEnd={props.isInteractive ? props.onPanEnd : undefined}
        >
            <motion.div 
                className="absolute w-64 h-64 z-10 flex items-center justify-center"
                initial={{ y: 20, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <motion.div 
                    className="w-full h-full shadow-[inset_0_-20px_30px_rgba(0,0,0,0.2),_0_10px_20px_rgba(0,0,0,0.3)] relative"
                    style={{
                        width: `${256}px`,
                        height: `${256}px`,
                    }}
                    animate={{ borderRadius: getShapeClipPath(shape) }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div 
                        className="w-full h-full bg-gradient-to-br from-white/30 to-transparent flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: color }}
                        animate={{ borderRadius: getShapeClipPath(shape) }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
                         <motion.div
                            className="absolute top-4 left-4 w-2/3 h-1/3 bg-white/20 rounded-full"
                            style={{ filter: 'blur(20px)', transform: 'rotate(-30deg)' }}
                         />
                        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: getShapeClipPath(shape) }}>
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ x: props.feature_offset_x, y: props.feature_offset_y }}
                                transition={{ duration: 1.5, type: 'spring' }}
                            >
                                {props.eye_style !== 'default' && (
                                    <motion.div 
                                        className="flex gap-20 absolute top-28" 
                                        style={{ transform: 'translateZ(20px)' }}
                                    >
                                        <motion.div className="relative" variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                                            {renderEye(props.eye_style, pupilX, pupilY, pupilScale, expression)}
                                            {props.eyebrow_style !== 'default' && renderEyebrow(props.eyebrow_style, expression, eyebrowVariants)}
                                        </motion.div>
                                        <motion.div className="relative" variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                                            {renderEye(props.eye_style, pupilX, pupilY, pupilScale, expression)}
                                            {props.eyebrow_style !== 'default' && renderEyebrow(props.eyebrow_style, expression, eyebrowVariants, true)}
                                        </motion.div>
                                    </motion.div>
                                )}
                                {props.mouth_style !== 'default' && (
                                     <motion.div 
                                        className="absolute bottom-12" 
                                        style={{ transform: 'translateZ(10px)' }}
                                    >
                                        <svg width="100" height="40" viewBox="0 0 100 80">
                                            <motion.path
                                                stroke="black"
                                                strokeWidth={5}
                                                strokeLinecap="round"
                                                variants={expressionMouthVariants}
                                                animate={expression}
                                                transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
                                            />
                                        </svg>
                                    </motion.div>
                                )}

                                <motion.div
                                    className="absolute flex justify-center w-full"
                                    style={{ top: '110px', transform: 'translateZ(30px)' }}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: props.show_sunglasses ? 1 : 0, y: props.show_sunglasses ? 0 : -20 }}
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
                                    animate={{ opacity: props.show_mustache ? 1 : 0, scale: props.show_mustache ? 1 : 0.5 }}
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
        </motion.div>
    );
};
