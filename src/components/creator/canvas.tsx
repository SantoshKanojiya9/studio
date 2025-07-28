
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { CharacterStyle } from '@/app/creator/page';
import { cn } from '@/lib/utils';

interface CreatorCanvasProps {
  style: CharacterStyle;
}

export function CreatorCanvas({ style }: CreatorCanvasProps) {
  const { backgroundColor, size, shape } = style;

  return (
    <motion.div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <motion.div
        className={cn(
            'shadow-lg',
            shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
        )}
        style={{
          backgroundColor,
          width: '100%',
          height: '100%',
        }}
        animate={{
          backgroundColor,
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? '50%' : '1.5rem',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Facial features will go here */}
      </motion.div>
    </motion.div>
  );
}
