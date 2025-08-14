
'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { Face } from '@/components/emoji-face';
import type { Expression, ShapeType, FeatureStyle, AnimationType } from '@/app/design/page';

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
};

export const CreatorMoji = (props: CreatorMojiProps) => {
    return (
        <motion.div 
            className="relative w-80 h-96 flex flex-col items-center justify-center"
        >
             <motion.div 
                className="absolute w-full h-64 z-10 flex items-center justify-center"
             >
                 {/* Re-use the main Face component, but with a different base color and no platform */}
                 <Face {...props} color="#333333" showPlatform={false} />
             </motion.div>
        </motion.div>
    );
};
