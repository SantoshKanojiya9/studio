
'use client';

import type { EmojiState } from '@/app/design/page';
import { Face } from '@/components/emoji-face';
import { ClockFace } from '@/components/loki-face';
import { cn } from '@/lib/utils';
import { motion, useMotionValue } from 'framer-motion';
import React from 'react';

const MiniFace = ({ emoji }: { emoji: EmojiState }) => {
    
    const containerStyle: React.CSSProperties = {
        backgroundColor: emoji.background_color,
        filter: emoji.selected_filter && emoji.selected_filter !== 'None' 
            ? `${emoji.selected_filter.toLowerCase().replace('-', '')}(1)` 
            : 'none',
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
    if (emojiToRender.model === 'loki' && emojiToRender.shape === 'blob') {
        emojiToRender.shape = 'default';
    }

    return (
        <div 
            className="w-full h-full shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1)] relative"
            style={containerStyle}
        >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
            
            <motion.div 
                className="origin-center" 
                style={{ scale: 0.35 }} 
                animate={{ scale: 0.35 }}
                transition={{ duration: 0 }}
            >
             {emojiToRender.model === 'loki' ? (
                <ClockFace 
                    {...emojiToRender}
                    animation_type={emojiToRender.animation_type}
                    color={emojiToRender.emoji_color}
                    isDragging={false}
                    isInteractive={false}
                    feature_offset_x={featureOffsetX}
                    feature_offset_y={featureOffsetY}
                    setColor={() => {}}
                />
            ) : (
                <Face 
                    {...emojiToRender}
                    animation_type={emojiToRender.animation_type}
                    color={emojiToRender.emoji_color}
                    isDragging={false}
                    onPan={() => {}}
                    onPanStart={() => {}}
                    onPanEnd={() => {}}
                    feature_offset_x={featureOffsetX}
                    feature_offset_y={featureOffsetY}
                    setColor={() => {}}
                />
            )}
            </motion.div>
        </div>
    );
};

export const GalleryThumbnail = ({ emoji, onSelect }: { emoji: EmojiState; onSelect: () => void; }) => {
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
};



    
