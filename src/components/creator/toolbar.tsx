
'use client';

import React from 'react';
import type { CharacterStyle, MenuType, Shape, AnimationType } from '@/app/creator/page';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ArrowLeft, Glasses, Palette, Shapes, Smile, Wand2, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, ArrowUpLeft } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { TooltipProvider } from '../ui/tooltip';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
                 <div className="space-y-4 px-1">
                    <div className="space-y-2">
                        <Label>Shape</Label>
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
                </div>
            )
        case 'colors':
            return (
                <div className="space-y-4 px-1">
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
                 <div className="grid grid-cols-3 gap-2 px-1">
                   {animations.map(({name, icon: Icon, label}) => (
                        <Button 
                            key={name} 
                            variant={animationType === name ? 'default' : 'outline'}
                            onClick={() => setAnimationType(name)}
                            className="flex flex-col h-auto p-2 text-xs"
                        >
                            <Icon className="h-5 w-5 mb-1" />
                            {label}
                        </Button>
                   ))}
                </div>
            )
        case 'accessories':
            return (
                <div className="space-y-4 px-1">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                         <Label htmlFor="sunglasses-switch" className="flex items-center gap-3 cursor-pointer">
                            <Glasses className="h-5 w-5" />
                            <span className="font-medium">Sunglasses</span>
                        </Label>
                        <Switch id="sunglasses-switch" checked={style.showSunglasses} onCheckedChange={(checked) => handleStyleChange('showSunglasses', checked)} />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                         <Label htmlFor="mustache-switch" className="flex items-center gap-3 cursor-pointer">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.25,12.05c0,5.65-4.14,7.2-9.25,7.2S3.75,17.7,3.75,12.05c0-4.06,2.23-5.23,3.73-6.23C8.5,5,9.5,2,13,2s4.5,3,5.5,3.82C20,6.82,22.25,7.99,22.25,12.05Z"/></svg>
                            <span className="font-medium">Mustache</span>
                        </Label>
                        <Switch id="mustache-switch" checked={style.showMustache} onCheckedChange={(checked) => handleStyleChange('showMustache', checked)} />
                    </div>
                </div>
            )
        default: // main menu
        return (
            <div className="flex w-max space-x-1 p-1 mx-auto items-center">
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
            </div>
        );
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
                {activeMenu !== 'main' ? (
                     <div className="flex items-center px-1">
                        <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Separator orientation="vertical" className="h-8 mx-2" />
                        <h3 className="font-medium text-base capitalize">{activeMenu}</h3>
                    </div>
                ) : renderMenu()}
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </TooltipProvider>

        <Separator />
        
        {activeMenu !== 'main' && renderMenu()}
    </div>
  );
}
