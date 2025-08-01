
'use client';

import Link from 'next/link';
import type { EmojiState } from '@/app/design/page';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const MiniFace = ({ emoji }: { emoji: EmojiState }) => {
    const eyeVariants = {
        neutral: { y: 0, scaleY: 1 },
        happy: { y: 1, scaleY: 0.8 },
        angry: { y: 0.5, scaleY: 0.8, rotate: -2 },
        sad: { y: 1.5, scaleY: 0.9 },
        surprised: { y: -0.75, scaleY: 1.1 },
        scared: { y: -1, scaleY: 1.2, scaleX: 1.1 },
        love: { y: 0.5, scaleY: 1 },
    };

    const mouthVariants: Record<string, any> = {
        default: { d: "M 8 12 Q 12.5 15 17 12" },
        'male-1': { d: "M 8 13 H 17" },
        'male-2': { d: "M 8 12 Q 12.5 10 17 12" },
        'male-3': { d: "M 8 15 Q 12.5 17.5 17 15" },
        'female-1': { d: "M 8 13 Q 12.5 17.5 17 13" },
        'female-2': { d: "M 6 12 C 9 15, 16 15, 19 12" },
        'female-3': { d: "M 10 13 A 2.5 1.25 0 0 0 15 13" },
    };

    const expressionMouthVariants = {
        neutral: { d: mouthVariants[emoji.mouthStyle]?.d || mouthVariants.default.d },
        happy: { d: "M 8 12 Q 12.5 17.5 17 12" },
        angry: { d: "M 6 15 Q 12.5 8.75 19 15" },
        sad: { d: "M 8 15 Q 12.5 12.5 17 15" },
        surprised: { d: "M 10 13 Q 12.5 17.5 15 13 A 2.5 2.5 0 0 1 10 13" },
        scared: { d: "M 9 12 Q 12.5 16.25 16 12 A 3.75 3.75 0 0 1 9 12" },
        love: { d: "M 8 12 Q 12.5 18.75 17 12" },
    };
  
    const eyebrowVariants = {
        neutral: { y: 0, rotate: 0 },
        happy: { y: -1, rotate: -5 },
        angry: { y: 1, rotate: 20 },
        sad: { y: 0.5, rotate: -10 },
        surprised: { y: -1.5, rotate: 5 },
        scared: { y: -2, rotate: 3 },
        love: { y: -1.25, rotate: -5 },
    };

    const blushVariants = {
        neutral: { opacity: 0 },
        happy: { opacity: 0.7 },
        love: { opacity: 0.9 },
        angry: { opacity: 0 },
        sad: { opacity: 0 },
        surprised: { opacity: 0 },
        scared: { opacity: 0 },
    };
    
    const renderEye = (style: typeof emoji.eyeStyle) => {
        const eyeBase = (
            <div className="w-3 h-2.5 bg-fuchsia-200 rounded-full relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-black rounded-full" style={{ transform: 'translate(-50%, -50%)' }}>
                    {emoji.expression === 'love' && <Heart className="w-1.5 h-1.5 text-red-500 fill-current" />}
                </div>
            </div>
        );
         switch (style) {
            case 'male-1': return <div className="w-3 h-2 bg-fuchsia-200 rounded-sm relative overflow-hidden">{eyeBase}</div>;
            case 'male-2': return <div className="w-3 h-2.5 bg-fuchsia-200 rounded-t-full relative overflow-hidden">{eyeBase}</div>;
            case 'male-3': return <div className="w-2.5 h-2.5 bg-fuchsia-200 rounded-sm relative overflow-hidden">{eyeBase}</div>;
            case 'female-1': return <div className="w-3 h-2.5 bg-fuchsia-200 rounded-full relative overflow-hidden border border-black"><div className="absolute -top-px right-0 w-1 h-1 bg-fuchsia-200" style={{clipPath:'polygon(0 0, 100% 0, 100% 100%)'}}/>{eyeBase}</div>;
            case 'female-2': return <div className="w-3 h-3 bg-fuchsia-200 rounded-full relative overflow-hidden flex items-center justify-center">{eyeBase}</div>;
            case 'female-3': return <div className="w-3.5 h-2 bg-fuchsia-200 rounded-tl-md rounded-br-md relative overflow-hidden">{eyeBase}</div>;
            default: return eyeBase;
        }
    };
    
    const renderEyebrow = (style: typeof emoji.eyebrowStyle, isRight?: boolean) => {
        const baseStyle: React.CSSProperties = {
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)',
            transformOrigin: 'center',
            transform: isRight ? 'scaleX(-1)' : 'none',
        };
        const eyebrowMotion = {
            variants: eyebrowVariants,
            animate: emoji.expression,
            transition: { duration: 0 }
        };

        switch (style) {
            case 'male-1': return <motion.div className="absolute -top-1 left-0 w-3.5 h-1 bg-black" style={{ ...baseStyle, clipPath: 'polygon(0 0, 100% 20%, 90% 100%, 10% 100%)' }} {...eyebrowMotion} />;
            case 'male-2': return <motion.div className="absolute -top-1 left-0 w-3 h-1.5 bg-black" style={{ ...baseStyle, borderRadius: '1px' }} {...eyebrowMotion} />;
            case 'male-3': return <motion.div className="absolute -top-0.5 left-0 w-3 h-0.5 bg-black" style={baseStyle} {...eyebrowMotion} />;
            case 'female-1': return <motion.div className="absolute -top-1 left-0 w-3 h-0.5 bg-black" style={{ ...baseStyle, clipPath: 'path("M0,2.5 C2.5,0 10,0 12.5,2.5")' }} {...eyebrowMotion} />;
            case 'female-2': return <motion.div className="absolute -top-1 left-0 w-3 h-0.5 bg-black" style={{ ...baseStyle }} {...eyebrowMotion} />;
            case 'female-3': return <motion.div className="absolute -top-1 left-0 w-3 h-1 bg-black/80" style={{ ...baseStyle, clipPath: 'polygon(0 50%, 100% 0, 100% 100%, 0 100%)' }} {...eyebrowMotion} />;
            default: return <motion.div className="absolute -top-1 left-0 w-3 h-1 bg-black" style={baseStyle} {...eyebrowMotion} />;
        }
    };
    
    const shapeStyle = {
        borderRadius: getShapeClipPath(emoji.shape),
        backgroundColor: emoji.emojiColor,
        filter: emoji.selectedFilter && emoji.selectedFilter !== 'None' ? `${emoji.selectedFilter.toLowerCase().replace('-', '')}(1)` : 'none',
    };

    const faceMotionProps = {
        transition: { duration: 0 }
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            <motion.div 
                className="w-24 h-16 shadow-[inset_0_-5px_8px_rgba(0,0,0,0.2),_0_2px_5px_rgba(0,0,0,0.3)] relative"
                style={shapeStyle}
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div className="flex justify-between w-14 absolute top-10" variants={blushVariants} animate={emoji.expression} {...faceMotionProps}>
                        <motion.div className="w-3 h-1.5 bg-pink-400 rounded-full" />
                        <motion.div className="w-3 h-1.5 bg-pink-400 rounded-full" />
                    </motion.div>
                    <motion.div className="flex gap-5 absolute top-7">
                        <motion.div className="relative" variants={eyeVariants} animate={emoji.expression} {...faceMotionProps}>
                            {renderEye(emoji.eyeStyle)}
                            {renderEyebrow(emoji.eyebrowStyle)}
                        </motion.div>
                        <motion.div className="relative" variants={eyeVariants} animate={emoji.expression} {...faceMotionProps}>
                            {renderEye(emoji.eyeStyle)}
                            {renderEyebrow(emoji.eyebrowStyle, true)}
                        </motion.div>
                    </motion.div>
                    <motion.div className="absolute top-9">
                        <svg width="25" height="10" viewBox="0 0 25 20">
                            <motion.path
                                fill="transparent"
                                stroke="black"
                                strokeWidth={1.25}
                                strokeLinecap="round"
                                variants={expressionMouthVariants}
                                animate={emoji.expression}
                                {...faceMotionProps}
                            />
                        </svg>
                    </motion.div>
                    {emoji.showSunglasses && (
                        <div className="absolute flex justify-center w-full" style={{ top: '28px', transform: 'scale(0.25)' }}>
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
                        <div className="absolute flex justify-center w-full" style={{ top: '42px', transform: 'scale(0.25)' }}>
                            <svg width="100" height="30" viewBox="0 0 100 30">
                                <path d="M 10 15 C 20 -5, 80 -5, 90 15 Q 50 10, 10 15" fill="#4a2c0f" />
                            </svg>
                        </div>
                    )}
                </div>
            </motion.div>
             <motion.div className="absolute bottom-0 w-24 h-4">
                <div className="absolute bottom-0 left-0 w-full h-3 bg-gray-700 rounded-full shadow-inner" style={{ transform: 'rotateX(70deg) translateZ(-5px)' }}></div>
                <div className="absolute bottom-[-2.5px] left-1/2 w-[98%] h-4 bg-gray-800 rounded-full" style={{ transform: 'translateX(-50%) rotateX(80deg) translateZ(-4px)', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}></div>
            </motion.div>
        </div>
    );
};


export const GalleryThumbnail = ({ emoji }: { emoji: EmojiState }) => {
    return (
        <Link 
            href={`/design?emojiId=${emoji.id}`}
            className="aspect-square w-full rounded-md overflow-hidden relative group"
            style={{ backgroundColor: emoji.backgroundColor }}
        >
            <div className={cn(
                "w-full h-full flex items-center justify-center transform transition-transform duration-300 ease-in-out group-hover:scale-110"
            )}>
                <MiniFace emoji={emoji} />
            </div>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
    );
};


function getShapeClipPath(shape: EmojiState['shape']) {
    const paths = {
        default: '50% 50% 40% 40% / 60% 60% 40% 40%',
        square: '10%',
        squircle: '30%',
        tear: '50% 50% 50% 50% / 60% 60% 40% 40%',
        blob: '40% 60% 40% 60% / 60% 40% 60% 40%',
    };
    return paths[shape] || paths.default;
};
