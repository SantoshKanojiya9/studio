
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
        justifyContent: 'center'
    };

    const faceMotionProps = {
        transition: { duration: 0 }
    };
    
    const eyeVariants = {
        neutral: { y: 0, scaleY: 1 }, happy: { y: 4, scaleY: 0.8 }, angry: { y: 2, scaleY: 0.8, rotate: -2 },
        sad: { y: 6, scaleY: 0.9 }, surprised: { y: -3, scaleY: 1.1 }, scared: { y: -4, scaleY: 1.2, scaleX: 1.1 },
        love: { y: 2, scaleY: 1 },
    };

    const mouthVariants: Record<string, any> = {
        default: { d: "M 30 50 Q 50 60 70 50" }, 'male-1': { d: "M 30 55 H 70" }, 'male-2': { d: "M 30 50 Q 50 40 70 50" },
        'male-3': { d: "M 30 60 Q 50 70 70 60" }, 'female-1': { d: "M 30 55 Q 50 70 70 55" }, 'female-2': { d: "M 25 50 C 35 60, 65 60, 75 50" },
        'female-3': { d: "M 40 55 A 10 5 0 0 0 60 55" },
    };

    const expressionMouthVariants = {
        neutral: { d: mouthVariants[emoji.mouthStyle]?.d || mouthVariants.default.d }, happy: { d: "M 30 50 Q 50 70 70 50" },
        angry: { d: "M 25 60 Q 50 35 75 60" }, sad: { d: "M 30 60 Q 50 50 70 60" },
        surprised: { d: "M 40 55 Q 50 70 60 55 A 10 10 0 0 1 40 55" }, scared: { d: "M 35 50 Q 50 65 65 50 A 15 15 0 0 1 35 50" },
        love: { d: "M 30 50 Q 50 75 70 50" },
    };
  
    const eyebrowVariants = {
        neutral: { y: 0, rotate: 0 }, happy: { y: -4, rotate: -5 }, angry: { y: 4, rotate: 20 },
        sad: { y: 2, rotate: -10 }, surprised: { y: -6, rotate: 5 }, scared: { y: -8, rotate: 3 },
        love: { y: -5, rotate: -5 },
    };

    const blushVariants = {
        neutral: { opacity: 0 }, happy: { opacity: 0.7 }, love: { opacity: 0.9 },
        angry: { opacity: 0 }, sad: { opacity: 0 }, surprised: { opacity: 0 },
        scared: { opacity: 0 },
    };
    
    const renderEye = (style: typeof emoji.eyeStyle) => {
        const eyeBase = (
            <div className="w-12 h-10 bg-white rounded-full relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-black rounded-full" style={{ transform: 'translate(-50%, -50%)' }}>
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/80 rounded-full"/>
                    {emoji.expression === 'love' && <div className="flex items-center justify-center w-full h-full"><Heart className="w-5 h-5 text-red-500 fill-current" /></div>}
                </div>
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
    
    const renderEyebrow = (style: typeof emoji.eyebrowStyle, isRight?: boolean) => {
        const baseStyle: React.CSSProperties = {
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)', transformOrigin: 'center',
            transform: isRight ? 'scaleX(-1)' : 'none',
        };
        const eyebrowMotion = {
            variants: eyebrowVariants, animate: emoji.expression, transition: { duration: 0 }
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
        <div 
            className="w-full h-full shadow-[inset_0_-8px_12px_rgba(0,0,0,0.2),_0_4px_8px_rgba(0,0,0,0.3)]"
            style={shapeStyle}
        >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
            <div className="relative w-full h-full flex items-center justify-center" style={{ transform: 'scale(0.35)'}}>
                <div className="absolute inset-0 top-[20%]">
                    <motion.div className="flex justify-between w-56 absolute top-40" variants={blushVariants} animate={emoji.expression} {...faceMotionProps}>
                        <motion.div className="w-12 h-6 bg-pink-400 rounded-full" />
                        <motion.div className="w-12 h-6 bg-pink-400 rounded-full" />
                    </motion.div>
                    <motion.div className="flex gap-20 absolute top-28">
                        <motion.div className="relative" variants={eyeVariants} animate={emoji.expression} {...faceMotionProps}>
                            {renderEye(emoji.eyeStyle)}
                            {renderEyebrow(emoji.eyebrowStyle)}
                        </motion.div>
                        <motion.div className="relative" variants={eyeVariants} animate={emoji.expression} {...faceMotionProps}>
                            {renderEye(emoji.eyeStyle)}
                            {renderEyebrow(emoji.eyebrowStyle, true)}
                        </motion.div>
                    </motion.div>
                    <motion.div className="absolute bottom-12">
                        <svg width="100" height="40" viewBox="0 0 100 80">
                            <motion.path
                                fill="transparent"
                                stroke="black"
                                strokeWidth={5}
                                strokeLinecap="round"
                                variants={expressionMouthVariants}
                                animate={emoji.expression}
                                {...faceMotionProps}
                            />
                        </svg>
                    </motion.div>
                    {emoji.showSunglasses && (
                        <div className="absolute flex justify-center w-full" style={{ top: '110px', transform: 'translateZ(30px)' }}>
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
                        <div className="absolute flex justify-center w-full" style={{ top: '170px', transform: 'translateZ(25px)' }}>
                            <svg width="100" height="30" viewBox="0 0 100 30">
                                <path d="M 10 15 C 20 -5, 80 -5, 90 15 Q 50 10, 10 15" fill="#4a2c0f" />
                            </svg>
                        </div>
                    )}
                </div>
                 <motion.div 
                    className="absolute bottom-[-110px] w-[90%] pb-2" style={{ height: '60px', transformStyle: 'preserve-3d', perspective: '1000px' }}
                    >
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gray-700 rounded-full shadow-inner" style={{ transform: 'rotateX(70deg) translateZ(-20px)' }}></div>
                    <div className="absolute bottom-[-10px] left-1/2 w-[98%] h-16 bg-gray-800 rounded-full" style={{ transform: 'translateX(-50%) rotateX(80deg) translateZ(-15px)', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}></div>
                </motion.div>
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
