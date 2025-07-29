
'use client';

import React from 'react';
import type { CharacterStyle, MenuType } from '@/app/creator/page';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ArrowLeft, Glasses, Palette, Shapes, Smile } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Tooltip, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

interface CreatorToolbarProps {
  style: CharacterStyle;
  setStyle: React.Dispatch<React.SetStateAction<CharacterStyle>>;
  activeMenu: MenuType;
  setActiveMenu: React.Dispatch<React.SetStateAction<MenuType>>;
}

export function CreatorToolbar({ style, setStyle, activeMenu, setActiveMenu }: CreatorToolbarProps) {
  const handleStyleChange = <K extends keyof CharacterStyle>(
    key: K,
    value: CharacterStyle[K]
  ) => {
    setStyle((prev) => ({ ...prev, [key]: value }));
  };

  const renderMenu = () => {
    switch (activeMenu) {
        case 'base':
            return (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="size">Size ({style.size}px)</Label>
                        <Slider
                            id="size"
                            min={50}
                            max={400}
                            step={10}
                            value={[style.size]}
                            onValueChange={(value) => handleStyleChange('size', value[0])}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Shape</Label>
                        <RadioGroup
                            value={style.shape}
                            onValueChange={(value) => handleStyleChange('shape', value as 'circle' | 'square')}
                            className="flex gap-4 pt-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="circle" id="r1" />
                                <Label htmlFor="r1">Circle</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="square" id="r2" />
                                <Label htmlFor="r2">Square</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            )
        case 'colors':
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bg-color">Color</Label>
                        <div className="relative">
                            <Input
                                id="bg-color"
                                type="color"
                                value={style.backgroundColor}
                                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                className="p-1 h-10 w-full"
                            />
                        </div>
                    </div>
                </div>
            )
        case 'expressions':
        case 'accessories':
            return (
                <div className="text-center text-muted-foreground py-8">
                    <p>Coming Soon!</p>
                </div>
            )
        default: // main menu is handled outside
            return null;

    }
  }

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-lg font-semibold tracking-tight">Model Creator</h2>
            <p className="text-sm text-muted-foreground">Customize your character's appearance.</p>
        </div>
      <Separator />
      
        <TooltipProvider>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 p-1 mx-auto items-center">
                    {activeMenu !== 'main' && (
                        <>
                            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Separator orientation="vertical" className="h-8" />
                        </>
                    )}
                    {activeMenu === 'main' ? (
                        <>
                            <Button variant="ghost" onClick={() => setActiveMenu('base')} className="flex flex-col h-auto p-2">
                                <Shapes className="h-5 w-5" />
                                <span className="text-xs mt-1">Base</span>
                            </Button>
                             <Button variant="ghost" onClick={() => setActiveMenu('colors')} className="flex flex-col h-auto p-2">
                                <Palette className="h-5 w-5" />
                                <span className="text-xs mt-1">Colors</span>
                            </Button>
                            <Button variant="ghost" onClick={() => setActiveMenu('expressions')} className="flex flex-col h-auto p-2">
                                <Smile className="h-5 w-5" />
                                <span className="text-xs mt-1">Expressions</span>
                            </Button>
                            <Button variant="ghost" onClick={() => setActiveMenu('accessories')} className="flex flex-col h-auto p-2">
                                <Glasses className="h-5 w-5" />
                                <span className="text-xs mt-1">Accessories</span>
                            </Button>
                        </>
                    ) : (
                        <h3 className="font-medium text-base capitalize pl-2">{activeMenu}</h3>
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </TooltipProvider>

        <Separator />
        
        <div className="px-1">
            {renderMenu()}
        </div>
    </div>
  );
}
