
'use client';

import React from 'react';
import { motion, MotionValue, useSpring, useTransform } from 'framer-motion';
import type { CharacterStyle } from '@/app/creator/page';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';


const FaceFeatures = ({ 
    style, 
    featureOffsetX, 
    featureOffsetY,
    pointerX,
    pointerY,
}: { 
    style: CharacterStyle, 
    featureOffsetX: MotionValue<number>, 
    featureOffsetY: MotionValue<number>,
    pointerX: MotionValue<number>,
    pointerY: MotionValue<number>,
}) => {
    const { expression, showSunglasses, showMustache } = style;

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
      neutral: { d: "M 30 50 Q 50 50 70 50" }, // Straight line
      happy: { d: "M 30 50 Q 50 70 70 50" }, // Smile
      angry: { d: "M 30 60 Q 50 30 70 60" }, // Angry
      sad: { d: "M 30 60 Q 50 50 70 60" }, // Sad mouth
      surprised: { d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55" }, // Open mouth
      scared: { d: "M 35 50 Q 50 65 65 50 A 15 15 0 0 1 35 50" }, // Open mouth scared
      love: { d: "M 30 50 Q 50 75 70 50" }, // Big smile for love
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

    return (
        <motion.div 
            className="absolute inset-0 p-[10px] overflow-hidden"
            style={{ borderRadius: 'inherit' }}
        >
            <motion.div
                className="absolute inset-[10px] flex items-center justify-center"
                style={{ x: featureOffsetX, y: featureOffsetY }}
                transition={{ duration: 1.5, type: 'spring' }}
            >
                <motion.div 
                    className="flex justify-between w-2/3 absolute top-40"
                    animate={expression}
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
                    className="flex gap-16 absolute top-28" 
                    style={{ transform: 'translateZ(20px)' }}
                    animate={expression}
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
                        <div className="flex justify-between items-center w-2/3 h-[45px]">
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
        </motion.div>
    );
}

export function CreatorCanvas({ 
    style, 
    featureOffsetX, 
    featureOffsetY,
    pointerX,
    pointerY,
}: { 
    style: CharacterStyle, 
    featureOffsetX: MotionValue<number>, 
    featureOffsetY: MotionValue<number>,
    pointerX: MotionValue<number>,
    pointerY: MotionValue<number>,
}) {
  const { backgroundColor, size, shape } = style;

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

  const getShapeStyles = () => {
    switch(shape) {
      case 'circle':
        return { borderRadius: '50% 50% 40% 40% / 60% 60% 40% 40%' };
      case 'square':
        return { borderRadius: '1.5rem' };
      case 'oval':
        return { width: `${size * 0.75}px`, borderRadius: '50%' };
      case 'rectangle':
         return { width: `${size * 0.75}px`, borderRadius: '1.5rem' };
      case 'triangle':
        return { 
            width: 0,
            height: 0,
            borderLeft: `${size/2}px solid transparent`,
            borderRight: `${size/2}px solid transparent`,
            borderBottom: `${size}px solid ${backgroundColor}`,
            backgroundColor: 'transparent',
        };
      case 'pentagon':
         return { 
            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
        };
      default:
        return { borderRadius: '50%' };
    }
  }

  const shapeStyle = getShapeStyles();
  const isGeometric = shape === 'triangle' || shape === 'pentagon';


  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        transformStyle: 'preserve-3d',
      }}
       animate={{
          width: size,
          height: size,
        }}
       transition={{ type: 'spring', stiffness: 300, damping: 30 }}
       onPointerMove={handlePointerMove}
       onPointerLeave={handlePointerLeave}
    >
      <motion.div 
        className="absolute top-0 w-full h-[calc(100%_-_60px)] z-10"
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
            className={cn(
                'relative w-full h-full'
            )}
            style={{
            ...shapeStyle,
            backgroundColor: isGeometric ? undefined : backgroundColor,
            borderBottomColor: shape === 'triangle' ? backgroundColor : undefined,
            }}
            animate={{
            backgroundColor: isGeometric ? 'transparent' : backgroundColor,
            borderBottomColor: shape === 'triangle' ? backgroundColor : 'transparent',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {!isGeometric && (
                <div 
                    className="w-full h-full flex items-center justify-center relative overflow-hidden"
                    style={{ borderRadius: 'inherit' }}
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
                    <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center relative overflow-hidden"></div>
                </div>
            )}
        </motion.div>
      </motion.div>
      <div
        className="absolute inset-0"
      >
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          top: shape === 'triangle' ? size / 4 : 0,
          }}>
            <FaceFeatures 
                style={style} 
                featureOffsetX={featureOffsetX} 
                featureOffsetY={featureOffsetY} 
                pointerX={pointerX}
                pointerY={pointerY}
            />
        </div>
      </div>
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
}

    