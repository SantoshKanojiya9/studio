
'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import type { CharacterStyle } from '@/app/creator/page';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';


const FaceFeatures = ({ style, featureOffsetX, featureOffsetY }: { style: CharacterStyle, featureOffsetX: MotionValue<number>, featureOffsetY: MotionValue<number> }) => {
    const { expression, showSunglasses, showMustache } = style;

    const eyeVariants = {
        neutral: { y: 0, scaleY: 1 },
        happy: { y: 4, scaleY: 0.8 },
        angry: { y: -2, scaleY: 1 },
        sad: { y: 6, scaleY: 0.9 },
        surprised: { y: -3, scaleY: 1.1 },
    };

    const mouthVariants = {
        neutral: { d: "M 30 50 Q 50 50 70 50" },
        happy: { d: "M 30 50 Q 50 70 70 50" },
        angry: { d: "M 30 60 Q 50 30 70 60" },
        sad: { d: "M 30 60 Q 50 50 70 60" },
        surprised: { d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55" },
    };
    
    const eyebrowVariants = {
        neutral: { y: 0, rotate: 0 },
        happy: { y: -4, rotate: -5 },
        angry: { y: 2, rotate: 10 },
        sad: { y: 2, rotate: -10 },
        surprised: { y: -6, rotate: 5 },
    }

    const blushVariants = {
        neutral: { opacity: 0 },
        happy: { opacity: 0.7 },
        angry: { opacity: 0.4 },
        sad: { opacity: 0.2 },
        surprised: { opacity: 0.1 },
    }

    return (
        <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ x: featureOffsetX, y: featureOffsetY }}
            transition={{ duration: 1.5, type: 'spring' }}
        >
             <motion.div 
                className="flex justify-between w-2/3 absolute top-[60%]"
            >
                <motion.div 
                    className="w-1/4 h-6 bg-pink-400/80 rounded-full"
                    variants={blushVariants}
                    animate={expression}
                    transition={{ duration: 0.3, type: "spring" }}
                />
                <motion.div 
                    className="w-1/4 h-6 bg-pink-400/80 rounded-full"
                    variants={blushVariants}
                    animate={expression}
                    transition={{ duration: 0.3, type: "spring" }}
                />
            </motion.div>
        
            <motion.div className="flex gap-x-[25%] absolute top-1/3">
                <motion.div className="relative" variants={eyeVariants} animate={expression} transition={{duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}>
                    <div className="w-12 h-10 bg-white rounded-full relative overflow-hidden border-2 border-black/80" >
                        <motion.div className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full" style={{ translateX: '-50%', translateY: '-50%' }} />
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
                    <div className="w-12 h-10 bg-white rounded-full relative overflow-hidden border-2 border-black/80">
                        <motion.div className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full" style={{ translateX: '-50%', translateY: '-50%' }} />
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
            <motion.div className="absolute top-2/3 -translate-y-1/2">
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
                style={{ top: 'calc(33.33% + 5px)' }} // Aligns with eyes
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: showSunglasses ? 1 : 0, y: showSunglasses ? 0 : -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                 <div className="flex justify-between items-center w-[70%] h-[40px]">
                    <div className="w-[45%] h-full bg-black/80 rounded-2xl border-2 border-gray-700"></div>
                    <div className="h-1 w-4 border-b-2 border-x-2 border-gray-700 rounded-b-sm self-start mt-2"></div>
                    <div className="w-[45%] h-full bg-black/80 rounded-2xl border-2 border-gray-700"></div>
                </div>
            </motion.div>
            <motion.div
                className="absolute flex justify-center w-full"
                style={{ top: 'calc(66.66% - 25px)' }} // Aligns with mouth
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: showMustache ? 1 : 0, scale: showMustache ? 1 : 0.5 }}
                transition={{ duration: 0.2 }}
            >
                <svg width="100" height="30" viewBox="0 0 100 30">
                    <path d="M 10 15 C 20 -5, 80 -5, 90 15 Q 50 10, 10 15" fill="#4a2c0f" />
                </svg>
            </motion.div>
        </motion.div>
    )
}


export function CreatorCanvas({ style, featureOffsetX, featureOffsetY }: { style: CharacterStyle, featureOffsetX: MotionValue<number>, featureOffsetY: MotionValue<number> }) {
  const { backgroundColor, size, shape } = style;

  const getShapeStyles = () => {
    switch(shape) {
      case 'circle':
        return { borderRadius: '50%' };
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
            boxShadow: 'none',
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
  const isTriangle = shape === 'triangle';

  return (
    <motion.div
      className="flex items-center justify-center relative"
      style={{
        width: size,
        height: size,
      }}
       animate={{
          width: size,
          height: size,
        }}
       transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.div
        className={cn(
            'shadow-lg relative',
            !isTriangle && 'overflow-hidden shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2),_0_5px_15px_rgba(0,0,0,0.2)]'
        )}
        style={{
          backgroundColor,
          width: '100%',
          height: '100%',
          ...shapeStyle
        }}
        animate={{
          backgroundColor: isTriangle ? 'transparent' : backgroundColor,
          borderBottomColor: isTriangle ? backgroundColor : undefined,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {!isTriangle && (
          <>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5"></div>
             <motion.div
                className="absolute top-[5%] left-[10%] w-4/5 h-1/2 bg-white/25 rounded-full"
                style={{
                  filter: 'blur(15px)',
                  transform: 'rotate(-15deg)',
                }}
              />
          </>
        )}
        <div style={{width: size, height: size, position: 'absolute', top: isTriangle ? `-${size/1.5}px`: 0, left: isTriangle ? `-${size/2}px`: 0}}>
             <FaceFeatures style={style} featureOffsetX={featureOffsetX} featureOffsetY={featureOffsetY} />
        </div>
      </motion.div>
    </motion.div>
  );
}
