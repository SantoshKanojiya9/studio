
'use client';

import React from 'react';
import type { CharacterStyle } from '@/app/creator/page';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '../ui/separator';

interface CreatorToolbarProps {
  style: CharacterStyle;
  setStyle: React.Dispatch<React.SetStateAction<CharacterStyle>>;
}

export function CreatorToolbar({ style, setStyle }: CreatorToolbarProps) {
  const handleStyleChange = <K extends keyof CharacterStyle>(
    key: K,
    value: CharacterStyle[K]
  ) => {
    setStyle((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-lg font-semibold tracking-tight">Model Creator</h2>
            <p className="text-sm text-muted-foreground">Customize your character's appearance.</p>
        </div>
      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium text-base">Base</h3>
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
    </div>
  );
}
