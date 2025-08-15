
'use client';

import type { EmojiState } from '@/app/design/page';
import { Face } from '@/components/emoji-face';
import { ClockFace } from '@/components/loki-face';
import { RimuruFace } from '@/components/rimuru-face';
import { CreatorMoji } from '@/components/creator-moji';
import { cn } from '@/lib/utils';
import { motion, useMotionValue } from 'framer-motion';
import React from 'react';

const filters = [
    { name: 'None', style: {}, css: 'none' },
    { name: 'Sepia', style: { background: 'linear-gradient(to right, #704214, #EAE0C8)' }, css: 'sepia(1)' },
    { name: 'Grayscale', style: { background: 'linear-gradient(to right, #333, #ccc)' }, css: 'grayscale(1)' },
    { name: 'Invert', style: { background: 'linear-gradient(to right, #f00, #0ff)' }, css: 'invert(1)' },
    { name: 'Hue-Rotate', style: { background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }, css: 'hue-rotate(90deg)' },
    { name: 'Contrast', style: { background: 'linear-gradient(to right, #000, #fff)' }, css: 'contrast(1.5)' },
    { name: 'Saturate', style: { background: 'linear-gradient(to right, gray, red)' }, css: 'saturate(2)' },
    { name: 'Vintage', style: { background: 'linear-gradient(to right, #6d5a4c, #d5c8b8)' }, css: 'sepia(0.5) saturate(1.5) contrast(0.9)' },
    { name: 'Cool', style: { background: 'linear-gradient(to right, #3a7bd5, #00d2ff)' }, css: 'contrast(1.1) brightness(1.1) hue-rotate(-15deg)' },
    { name: 'Warm', style: { background: 'linear-gradient(to right, #f7b733, #fc4a1a)' }, css: 'sepia(0.3) saturate(1.2) brightness(1.1)' },
  ];

const MiniFace = React.memo(({ emoji }: { emoji: EmojiState }) => {
    
    const activeFilterCss = filters.find(f => f.name === emoji.selected_filter)?.css || 'none';

    const containerStyle: React.CSSProperties = {
        backgroundColor: emoji.background_color,
        filter: activeFilterCss,
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    };

    // Initialize motion values required by Face/ClockFace components
    const featureOffsetX = useMotionValue(emoji.feature_offset_x || 0);
    const featureOffsetY = useMotionValue(emoji.feature_offset_y || 0);
    
    const emojiToRender = { ...emoji };
    if (emojiToRender.model === 'loki' && emojiToRender.shape === 'clay') {
        emojiToRender.shape = 'default';
    }

    const renderModel = () => {
        const props = {
            ...emojiToRender,
            animation_type: emojiToRender.animation_type,
            color: emojiToRender.emoji_color,
            isDragging: false,
            isInteractive: false,
            feature_offset_x: featureOffsetX,
            feature_offset_y: featureOffsetY,
            setColor: () => {},
        };

        switch(emojiToRender.model) {
            case 'creator':
                return <CreatorMoji {...props} />;
            case 'loki':
                return <ClockFace {...props} />;
            case 'rimuru':
                return <RimuruFace {...props} />;
            case 'emoji':
            default:
                return <Face {...props} />;
        }
    }


    return (
        <div 
            className="w-full h-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1)] relative"
            style={containerStyle}
        >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
            
            <motion.div 
                className="origin-center" 
                style={{ scale: 0.35 }} 
                animate={{ scale: 0.35 }}
                transition={{ duration: 0 }}
            >
             {renderModel()}
            </motion.div>
        </div>
    );
});
MiniFace.displayName = 'MiniFace';

export const GalleryThumbnail = React.memo(({ emoji, onSelect }: { emoji: EmojiState; onSelect: () => void; }) => {
    return (
        <div 
            className="relative group aspect-square cursor-pointer overflow-hidden rounded-md" 
            onClick={onSelect}
            style={{ backgroundColor: emoji.background_color }}
        >
            <div className={cn(
                "w-full h-full flex items-center justify-center transform transition-transform duration-300 ease-in-out group-hover:scale-105"
            )}>
                <MiniFace emoji={emoji} />
            </div>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    );
});
GalleryThumbnail.displayName = 'GalleryThumbnail';
