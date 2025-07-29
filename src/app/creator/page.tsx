
'use client';

import React, { useState, useEffect } from 'react';
import { CreatorCanvas } from '@/components/creator/canvas';
import { CreatorToolbar } from '@/components/creator/toolbar';
import { ChatHeader } from '@/components/chat-header';
import { useMotionValue, animate } from 'framer-motion';

export type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
export type Shape = 'circle' | 'square' | 'oval' | 'rectangle' | 'triangle' | 'pentagon';
export type AnimationType = 'left-right' | 'right-left' | 'up-down' | 'down-up' | 'diag-left-right' | 'diag-right-left' | 'random';

export type CharacterStyle = {
  backgroundColor: string;
  size: number;
  shape: Shape;
  expression: Expression;
  showSunglasses: boolean;
  showMustache: boolean;
};

export type MenuType = 'main' | 'base' | 'colors' | 'animations' | 'accessories';

export default function CreatorPage() {
  const [characterStyle, setCharacterStyle] = useState<CharacterStyle>({
    backgroundColor: '#ffb300',
    size: 250,
    shape: 'circle',
    expression: 'neutral',
    showSunglasses: false,
    showMustache: false,
  });
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');
  const [animationType, setAnimationType] = useState<AnimationType>('random');
  
  const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised'];
  const featureOffsetX = useMotionValue(0);
  const featureOffsetY = useMotionValue(0);

  useEffect(() => {
    let controlsX: ReturnType<typeof animate> | null = null;
    let controlsY: ReturnType<typeof animate> | null = null;
    let interval: NodeJS.Timeout | null = null;

    const stopAnimations = () => {
      controlsX?.stop();
      controlsY?.stop();
      if (interval) clearInterval(interval);
    };

    stopAnimations();
    
    const animationOptions = {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
    };

    const randomAnimation = () => {
        const newExpression = allExpressions[Math.floor(Math.random() * allExpressions.length)];
        setCharacterStyle(prev => ({ ...prev, expression: newExpression }));
        const newX = Math.random() * characterStyle.size * 0.2 - (characterStyle.size * 0.1);
        const newY = Math.random() * characterStyle.size * 0.2 - (characterStyle.size * 0.1);
        animate(featureOffsetX, newX, { type: 'spring', stiffness: 50, damping: 20 });
        animate(featureOffsetY, newY, { type: 'spring', stiffness: 50, damping: 20 });
    };

    switch (animationType) {
        case 'left-right':
            controlsX = animate(featureOffsetX, [-characterStyle.size * 0.1, characterStyle.size * 0.1], animationOptions);
            break;
        case 'right-left':
            controlsX = animate(featureOffsetX, [characterStyle.size * 0.1, -characterStyle.size * 0.1], animationOptions);
            break;
        case 'up-down':
            controlsY = animate(featureOffsetY, [-characterStyle.size * 0.1, characterStyle.size * 0.1], animationOptions);
            break;
        case 'down-up':
            controlsY = animate(featureOffsetY, [characterStyle.size * 0.1, -characterStyle.size * 0.1], animationOptions);
            break;
        case 'diag-left-right':
            controlsX = animate(featureOffsetX, [-characterStyle.size * 0.1, characterStyle.size * 0.1], animationOptions);
            controlsY = animate(featureOffsetY, [-characterStyle.size * 0.1, characterStyle.size * 0.1], animationOptions);
            break;
        case 'diag-right-left':
             controlsX = animate(featureOffsetX, [characterStyle.size * 0.1, -characterStyle.size * 0.1], animationOptions);
             controlsY = animate(featureOffsetY, [-characterStyle.size * 0.1, characterStyle.size * 0.1], animationOptions);
            break;
        case 'random':
            randomAnimation();
            interval = setInterval(randomAnimation, 3000);
            break;
    }


    return stopAnimations;
  }, [animationType, characterStyle.size]);

  return (
    <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-background">
            <ChatHeader />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 bg-secondary/20 h-full">
            <CreatorCanvas 
                style={characterStyle} 
                featureOffsetX={featureOffsetX}
                featureOffsetY={featureOffsetY}
            />
        </div>
        <div className="fixed bottom-16 left-0 right-0 w-full z-20">
            <CreatorToolbar 
                style={characterStyle} 
                setStyle={setCharacterStyle} 
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                animationType={animationType}
                setAnimationType={setAnimationType}
            />
        </div>
    </div>
  );
}
