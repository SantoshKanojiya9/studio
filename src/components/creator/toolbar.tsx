
'use client';

import React from 'react';
import type { CharacterStyle, MenuType, Shape, AnimationType } from '@/app/creator/page';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ArrowLeft, Glasses, Palette, Shapes, Smile, Wand2, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, ArrowUpLeft } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';


interface CreatorToolbarProps {
  style: CharacterStyle;
  setStyle: React.Dispatch<React.SetStateAction<CharacterStyle>>;
  activeMenu: MenuType;
  setActiveMenu: React.Dispatch<React.SetStateAction<MenuType>>;
  animationType: AnimationType;
  setAnimationType: React.Dispatch<React.SetStateAction<AnimationType>>;
}

export function CreatorToolbar({ style, setStyle, activeMenu, setActiveMenu, animationType, setAnimationType }: CreatorToolbarProps) {
  const handleStyleChange = <K extends keyof CharacterStyle>(
    key: K,
    value: CharacterStyle[K]
  ) => {
    setStyle((prev) => ({ ...prev, [key]: value }));
  };

  const renderMenu = () => {
    switch (activeMenu) {
        case 'base':
            const shapes: Shape[] = ['circle', 'square', 'oval', 'rectangle', 'triangle', 'pentagon'];
            return (
                 <>
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-5 w-5" /></Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <div className="space-y-2 w-48">
                        <Select
                            value={style.shape}
                            onValueChange={(value) => handleStyleChange('shape', value as Shape)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a shape" />
                            </SelectTrigger>
                            <SelectContent>
                                {shapes.map((shape) => (
                                    <SelectItem key={shape} value={shape} className="capitalize">
                                        {shape}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )
        case 'colors':
            return (
                <>
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-5 w-5" /></Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Label htmlFor="bg-color-input" className={cn(Button.defaultProps, "h-12 w-12 rounded-lg flex items-center justify-center border-2 border-border cursor-pointer")}>
                                <div className="h-8 w-8 rounded-md border" style={{backgroundColor: style.backgroundColor}} />
                                <Input id="bg-color-input" type="color" value={style.backgroundColor} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="sr-only" />
                            </Label>
                        </TooltipTrigger>
                        <TooltipContent><p>Color</p></TooltipContent>
                    </Tooltip>
                </>
            )
        case 'animations':
            const animations: { name: AnimationType, icon: React.ElementType, label: string }[] = [
                { name: 'left-right', icon: ArrowRight, label: 'L-R' },
                { name: 'right-left', icon: ArrowLeft, label: 'R-L' },
                { name: 'up-down', icon: ArrowDown, label: 'U-D' },
                { name: 'down-up', icon: ArrowUp, label: 'D-U' },
                { name: 'diag-left-right', icon: ArrowUpRight, label: 'Diag L-R' },
                { name: 'diag-right-left', icon: ArrowUpLeft, label: 'Diag R-L' },
                { name: 'random', icon: Wand2, label: 'Random' },
            ]
            return (
                <>
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-5 w-5" /></Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    {animations.map(({name, icon: Icon, label}) => (
                        <Tooltip key={name}>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant={animationType === name ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setAnimationType(name)}
                                >
                                    <Icon className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                             <TooltipContent><p>{label}</p></TooltipContent>
                        </Tooltip>
                   ))}
                </>
            )
        case 'accessories':
            return (
                <>
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-5 w-5" /></Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Label htmlFor="sunglasses-switch" className={cn('h-12 w-12 rounded-lg flex items-center justify-center border-2 cursor-pointer', style.showSunglasses ? 'border-primary bg-accent' : 'border-border')}>
                                <Glasses className="h-6 w-6" />
                                <Switch id="sunglasses-switch" checked={style.showSunglasses} onCheckedChange={(checked) => handleStyleChange('showSunglasses', checked)} className="sr-only" />
                            </Label>
                        </TooltipTrigger>
                        <TooltipContent><p>Toggle Sunglasses</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Label htmlFor="mustache-switch" className={cn('h-12 w-12 rounded-lg flex items-center justify-center border-2 cursor-pointer', style.showMustache ? 'border-primary bg-accent' : 'border-border')}>
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.25,12.05c0,5.65-4.14,7.2-9.25,7.2S3.75,17.7,3.75,12.05c0-4.06,2.23-5.23,3.73-6.23C8.5,5,9.5,2,13,2s4.5,3,5.5,3.82C20,6.82,22.25,7.99,22.25,12.05Z"/></svg>
                                <Switch id="mustache-switch" checked={style.showMustache} onCheckedChange={(checked) => handleStyleChange('showMustache', checked)} className="sr-only" />
                            </Label>
                        </TooltipTrigger>
                        <TooltipContent><p>Toggle Mustache</p></TooltipContent>
                    </Tooltip>
                </>
            )
        default: // main menu
        return (
            <>
                <Button variant="ghost" onClick={() => setActiveMenu('base')} className="flex flex-col h-auto p-2">
                    <Shapes className="h-5 w-5" />
                    <span className="text-xs mt-1">Base</span>
                </Button>
                <Button variant="ghost" onClick={() => setActiveMenu('colors')} className="flex flex-col h-auto p-2">
                    <Palette className="h-5 w-5" />
                    <span className="text-xs mt-1">Colors</span>
                </Button>
                <Button variant="ghost" onClick={() => setActiveMenu('animations')} className="flex flex-col h-auto p-2">
                    <Smile className="h-5 w-5" />
                    <span className="text-xs mt-1">Animations</span>
                </Button>
                <Button variant="ghost" onClick={() => setActiveMenu('accessories')} className="flex flex-col h-auto p-2">
                    <Glasses className="h-5 w-5" />
                    <span className="text-xs mt-1">Accessories</span>
                </Button>
            </>
        );
    }
  }

  return (
    <TooltipProvider>
        <ScrollArea className="w-full whitespace-nowrap bg-background/80 backdrop-blur-sm border-t border-border">
            <div className="flex w-max space-x-2 p-2 mx-auto">
                {renderMenu()}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </TooltipProvider>
  );
}

