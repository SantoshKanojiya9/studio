
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Expression = 'neutral' | 'happy' | 'angry';

const NeutralFace = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="15" x2="16" y2="15" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const HappyFace = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const AngryFace = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <path d="M7.5 8.5L10.5 11" />
    <path d="M16.5 8.5L13.5 11" />
  </svg>
);

const expressionMap = {
  neutral: { component: NeutralFace, color: 'text-gray-400' },
  happy: { component: HappyFace, color: 'text-green-500' },
  angry: { component: AngryFace, color: 'text-red-500' },
};

export default function DesignPage() {
  const [expression, setExpression] = useState<Expression>('neutral');

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // A standard mouse click will have pressure 0.5.
    // Pressure-sensitive devices can provide a range from 0 to 1.
    if (e.pressure > 0.5) {
      setExpression('angry');
    } else {
      setExpression('happy');
    }
  };

  const handlePointerUp = () => {
    setExpression('neutral');
  };

  const CurrentFace = expressionMap[expression].component;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background touch-none">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Interactive Emoji</h1>
        <p className="text-muted-foreground">Press on the emoji. A harder press makes it angry!</p>
        <p className="text-xs text-muted-foreground">(Requires a pressure-sensitive screen for best results)</p>
      </div>

      <div
        className="w-64 h-64 rounded-full flex items-center justify-center cursor-pointer select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} // Reset if the pointer leaves the area
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={expression}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentFace className={cn('w-60 h-60 transition-colors duration-200', expressionMap[expression].color)} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
