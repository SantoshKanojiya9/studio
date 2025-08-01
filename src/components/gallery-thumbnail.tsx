
'use client';

import Link from 'next/link';
import type { EmojiState } from '@/app/design/page';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart, Edit } from 'lucide-react';
import React from 'react';

const MiniFace = ({ emoji }: { emoji: EmojiState }) => {
    
    const shapeStyle: React.CSSProperties = {
        borderRadius: getShapeClipPath(emoji.shape),
        backgroundColor: emoji.emojiColor,
        filter: emoji.selectedFilter && emoji.selectedFilter !== 'None' 
            ? `${emoji.selectedFilter.toLowerCase().replace('-', '')}(1)` 
            : 'none',
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    };
    
    const eyeVariants = {
        neutral: { y: 0, scaleY: 1 }, happy: { y: 1, scaleY: 0.8 }, angry: { y: 0, scaleY: 0.8, rotate: -2 },
        sad: { y: 2, scaleY: 0.9 }, surprised: { y: -1, scaleY: 1.1 }, scared: { y: -1, scaleY: 1.2, scaleX: 1.1 },
        love: { y: 1, scaleY: 1 },
    };

    const mouthVariants: Record<string, any> = {
        default: { d: "M 15 25 Q 25 30 35 25" }, 'male-1': { d: "M 15 27 H 35" }, 'male-2': { d: "M 15 25 Q 25 20 35 25" },
        'male-3': { d: "M 15 30 Q 25 35 35 30" }, 'female-1': { d: "M 15 27 Q 25 35 35 27" }, 'female-2': { d: "M 12 25 C 17 30, 33 30, 38 25" },
        'female-3': { d: "M 20 27 A 5 2.5 0 0 0 30 27" },
    };

    const expressionMouthVariants = {
        neutral: { d: mouthVariants[emoji.mouthStyle]?.d || mouthVariants.default.d }, happy: { d: "M 15 25 Q 25 35 35 25" },
        angry: { d: "M 12 30 Q 25 18 38 30" }, sad: { d: "M 15 30 Q 25 25 35 30" },
        surprised: { d: "M 20 27 Q 25 35 30 27 A 5 5 0 0 1 20 27" }, scared: { d: "M 18 25 Q 25 32 32 25 A 7 7 0 0 1 18 25" },
        love: { d: "M 15 25 Q 25 37 35 25" },
    };
  
    const eyebrowVariants = {
        neutral: { y: 0, rotate: 0 }, happy: { y: -2, rotate: -5 }, angry: { y: 2, rotate: 20 },
        sad: { y: 1, rotate: -10 }, surprised: { y: -3, rotate: 5 }, scared: { y: -4, rotate: 3 },
        love: { y: -2, rotate: -5 },
    };

    const blushVariants = {
        neutral: { opacity: 0 }, happy: { opacity: 0.7 }, love: { opacity: 0.9 },
        angry: { opacity: 0 }, sad: { opacity: 0 }, surprised: { opacity: 0 },
        scared: { opacity: 0 },
    };

    const renderEye = (style: typeof emoji.eyeStyle) => {
        const eyeBase = (
            <div className="w-6 h-5 bg-white rounded-full relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-black rounded-full" style={{ transform: 'translate(-50%, -50%)' }}>
                    <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white/80 rounded-full"/>
                    {emoji.expression === 'love' && <div className="flex items-center justify-center w-full h-full"><Heart className="w-2.5 h-2.5 text-red-500 fill-current" /></div>}
                </div>
            </div>
        );
         switch (style) {
            case 'male-1': return <div className="w-6 h-4 bg-white rounded-sm relative overflow-hidden">{eyeBase}</div>;
            case 'male-2': return <div className="w-6 h-5 bg-white rounded-t-full relative overflow-hidden">{eyeBase}</div>;
            case 'male-3': return <div className="w-5 h-5 bg-white rounded-sm relative overflow-hidden">{eyeBase}</div>;
            case 'female-1': return <div className="w-6 h-5 bg-white rounded-full relative overflow-hidden border border-black"><div className="absolute -top-0.5 right-0 w-2 h-2 bg-white" style={{clipPath:'polygon(0 0, 100% 0, 100% 100%)'}}/>{eyeBase}</div>;
            case 'female-2': return <div className="w-6 h-6 bg-white rounded-full relative overflow-hidden flex items-center justify-center">{eyeBase}</div>;
            case 'female-3': return <div className="w-7 h-4 bg-white rounded-tl-lg rounded-br-lg relative overflow-hidden">{eyeBase}</div>;
            default: return eyeBase;
        }
    };
    
    const renderEyebrow = (style: typeof emoji.eyebrowStyle, isRight?: boolean) => {
        const baseStyle: React.CSSProperties = {
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)', transformOrigin: 'center',
            transform: isRight ? 'scaleX(-1)' : 'none',
        };
        const eyebrowMotion = {
            variants: eyebrowVariants, animate: emoji.expression, transition: { duration: 0 }
        };

        switch (style) {
            case 'male-1': return <motion.div className="absolute -top-1.5 left-0 w-7 h-2 bg-black" style={{ ...baseStyle, clipPath: 'polygon(0 0, 100% 20%, 90% 100%, 10% 100%)' }} {...eyebrowMotion} />;
            case 'male-2': return <motion.div className="absolute -top-2 left-0 w-6 h-2.5 bg-black" style={{ ...baseStyle, borderRadius: '2px' }} {...eyebrowMotion} />;
            case 'male-3': return <motion.div className="absolute -top-1 left-0 w-6 h-1.5 bg-black" style={baseStyle} {...eyebrowMotion} />;
            case 'female-1': return <motion.div className="absolute -top-2 left-0 w-6 h-1.5 bg-black" style={{ ...baseStyle, clipPath: 'path("M0,5 C5,0 20,0 25,5")' }} {...eyebrowMotion} />;
            case 'female-2': return <motion.div className="absolute -top-1.5 left-0 w-6 h-1 bg-black" style={{ ...baseStyle }} {...eyebrowMotion} />;
            case 'female-3': return <motion.div className="absolute -top-1.5 left-0 w-6 h-2 bg-black/80" style={{ ...baseStyle, clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)' }} {...eyebrowMotion} />;
            default: return <motion.div className="absolute -top-1.5 left-0 w-6 h-2 bg-black" style={baseStyle} {...eyebrowMotion} />;
        }
    };

    return (
        <div 
            className="w-full h-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.2),_0_2px_4px_rgba(0,0,0,0.3)]"
            style={shapeStyle}
        >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%2.../%3E%3C/svg%3E')] opacity-10"></div>
            <div className="relative w-full h-full">
                {/* Face Content Scaled Container */}
                <div className="absolute w-full h-full top-0 left-0" style={{ transform: 'scale(0.8) translateY(10%)' }}>
                    <motion.div className="flex justify-between w-28 absolute top-20 left-1/2 -translate-x-1/2" variants={blushVariants} animate={emoji.expression} transition={{duration:0}}>
                        <motion.div className="w-6 h-3 bg-pink-400 rounded-full" />
                        <motion.div className="w-6 h-3 bg-pink-400 rounded-full" />
                    </motion.div>
                    
                    <motion.div className="flex gap-10 absolute top-12 left-1/2 -translate-x-1/2 items-center">
                        <motion.div className="relative" variants={eyeVariants} animate={emoji.expression} transition={{duration:0}}>
                            {renderEye(emoji.eyeStyle)}
                            {renderEyebrow(emoji.eyebrowStyle)}
                        </motion.div>
                        <motion.div className="relative" variants={eyeVariants} animate={emoji.expression} transition={{duration:0}}>
                            {renderEye(emoji.eyeStyle)}
                            {renderEyebrow(emoji.eyebrowStyle, true)}
                        </motion.div>
                    </motion.div>
                    
                    <motion.div className="absolute top-24 left-1/2 -translate-x-1/2">
                        <svg width="50" height="20" viewBox="0 0 50 40">
                            <motion.path
                                fill="transparent"
                                stroke="black"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                variants={expressionMouthVariants}
                                animate={emoji.expression}
                                transition={{duration:0}}
                            />
                        </svg>
                    </motion.div>

                    {emoji.showSunglasses && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-10px]" style={{ transform: 'translate(-50%, -50%) scale(0.4) translateY(-80px)' }}>
                             <div className="relative">
                                <div className="flex justify-between items-center w-[180px] h-[45px]">
                                    <div className="w-[70px] h-full bg-black/80 rounded-2xl border-2 border-gray-700"></div>
                                    <div className="h-1 w-4 border-b-2 border-x-2 border-gray-700 rounded-b-sm self-center"></div>
                                    <div className="w-[70px] h-full bg-black/80 rounded-2xl border-2 border-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {emoji.showMustache && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[20px]" style={{ transform: 'translate(-50%, -50%) scale(0.4) translateY(20px)' }}>
                             <svg width="100" height="30" viewBox="0 0 100 30">
                                <path d="M 10 15 C 20 -5, 80 -5, 90 15 Q 50 10, 10 15" fill="#4a2c0f" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Base Shadow */}
                <div 
                    className="absolute bottom-[-20px] w-[80%] h-[40px] left-1/2 -translate-x-1/2" 
                    style={{ transformStyle: 'preserve-3d', perspective: '100px' }}
                >
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-700 rounded-full" style={{ transform: 'rotateX(75deg) translateZ(-5px)' }}></div>
                    <div className="absolute bottom-[-5px] left-1/2 w-[98%] h-3/4 bg-gray-800 rounded-full" style={{ transform: 'translateX(-50%) rotateX(80deg) translateZ(-8px)' }}></div>
                </div>
            </div>
        </div>
    );
};

export const GalleryThumbnail = ({ emoji, onSelect }: { emoji: EmojiState; onSelect: () => void; }) => {
    return (
        <div 
            className="relative group aspect-square cursor-pointer overflow-hidden rounded-md" 
            onClick={onSelect}
            style={{ backgroundColor: emoji.backgroundColor }}
        >
            <div className={cn(
                "w-full h-full flex items-center justify-center transform transition-transform duration-300 ease-in-out group-hover:scale-105"
            )}>
                <MiniFace emoji={emoji} />
            </div>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Link 
                href={`/design?emojiId=${emoji.id}`}
                className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40"
                aria-label="Edit emoji"
                onClick={(e) => e.stopPropagation()}
            >
                <Edit className="h-3 w-3" />
            </Link>
        </div>
    );
};

function getShapeClipPath(shape: EmojiState['shape']) {
    const paths: Record<typeof shape, string> = {
        default: '50% 50% 40% 40% / 60% 60% 40% 40%',
        square: '10%',
        squircle: '30%',
        tear: '50% 50% 50% 50% / 60% 60% 40% 40%',
        blob: '40% 60% 40% 60% / 60% 40% 60% 40%',
    };
    return paths[shape] || paths.default;
};
