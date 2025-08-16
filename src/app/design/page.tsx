
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue } from 'framer-motion';
import { Loader2, Plus, RotateCcw, Save, Wand2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSearchParams, useRouter } from 'next/navigation';
import { Face } from '@/components/emoji-face';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DesignToolbar } from '@/components/design-toolbar';
import { ClockFace } from '@/components/loki-face';
import { RimuruFace } from '@/components/rimuru-face';
import { CreatorMoji } from '@/components/creator-moji';
import { Droplet, Users, Clock } from 'lucide-react';


export type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'scared' | 'love';
export type MenuType = 'main' | 'expressions' | 'colors' | 'accessories' | 'filters' | 'animations' | 'shapes' | 'face' | 'eyes' | 'mouth' | 'eyebrows' | 'caption';
export type AnimationType = 'left-right' | 'right-left' | 'up-down' | 'down-up' | 'diag-left-right' | 'diag-right-left' | 'random' | 'none';
export type ShapeType = 'default' | 'square' | 'squircle' | 'tear' | 'clay' | 'sphere' | 'blob';
export type FeatureStyle = 'default' | 'male-1' | 'male-2' | 'male-3' | 'female-1' | 'female-2' | 'female-3';
type ModelType = 'emoji' | 'loki' | 'rimuru' | 'creator';


export type EmojiState = {
    id: string;
    created_at?: string;
    user_id?: string;
    model: ModelType;
    expression: Expression;
    background_color: string;
    emoji_color: string;
    show_sunglasses: boolean;
    show_mustache: boolean;
    selected_filter: string | null;
    animation_type: AnimationType;
    shape: ShapeType;
    eye_style: FeatureStyle;
    mouth_style: FeatureStyle;
    eyebrow_style: FeatureStyle;
    feature_offset_x: number;
    feature_offset_y: number;
    clay_width?: number;
    clay_height?: number;
    caption?: string;
    user?: {
      id: string;
      name: string;
      picture: string;
    }
};


const DesignPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  
  const [id, setId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [model, setModel] = useState<ModelType>('emoji');
  const [expression, setExpression] = useState<Expression>('neutral');
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');
  
  const [background_color, setBackgroundColor] = useState('#0a0a0a');
  const [emoji_color, setEmojiColor] = useState('#ffb300');
  const [show_sunglasses, setShowSunglasses] = useState(false);
  const [show_mustache, setShowMustache] = useState(false);
  const [selected_filter, setSelectedFilter] = useState<string | null>(null);
  const [animation_type, setAnimationType] = useState<AnimationType>('random');
  const [isDragging, setIsDragging] = useState(false);
  const [shape, setShape] = useState<ShapeType>('default');
  const [eye_style, setEyeStyle] = useState<FeatureStyle>('default');
  const [mouth_style, setMouthStyle] = useState<FeatureStyle>('default');
  const [eyebrow_style, setEyebrowStyle] = useState<FeatureStyle>('default');
  const [caption, setCaption] = useState('');
  
  const defaultBackgroundColor = '#0a0a0a';
  const defaultEmojiColor = '#ffb300';
  const defaultLokiColor = 'orangered';
  const defaultRimuruColor = '#3498db';
  const defaultCreatorColor = '#333333';
  
  const dragOrigin = useRef<{ x: number, y: number } | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feature_offset_x = useMotionValue(0);
  const feature_offset_y = useMotionValue(0);

  const applyEmojiState = (emoji: EmojiState) => {
    setId(emoji.id);
    setModel(emoji.model);
    setExpression(emoji.expression);
    setBackgroundColor(emoji.background_color);
    setEmojiColor(emoji.emoji_color);
    setShowSunglasses(emoji.show_sunglasses);
    setShowMustache(emoji.show_mustache);
    setSelectedFilter(emoji.selected_filter);
    setAnimationType(emoji.animation_type);
    setShape(emoji.shape);
    setEyeStyle(emoji.eye_style);
    setMouthStyle(emoji.mouth_style);
    setEyebrowStyle(emoji.eyebrow_style);
    feature_offset_x.set(emoji.feature_offset_x);
    feature_offset_y.set(emoji.feature_offset_y);
    setCaption(emoji.caption || '');
  }

  useEffect(() => {
    const emojiId = searchParams.get('emojiId');

    const fetchAndApplyEmoji = async () => {
        if (!emojiId || !supabase) {
            handleReset(false); // Reset but don't navigate
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('emojis')
                .select('*')
                .eq('id', emojiId)
                .single();

            if (error) {
                toast({ title: 'Error loading creation', description: "Could not find the specified creation.", variant: 'destructive'});
                router.replace('/design', undefined);
                handleReset();
            } else if (data) {
                applyEmojiState(data as EmojiState);
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive'});
            router.replace('/design', undefined);
        } finally {
            setIsLoading(false);
        }
    };

    fetchAndApplyEmoji();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams, supabase, router]);

  
  const handleReset = (navigate = true) => {
    if (navigate) {
        router.replace('/design', undefined);
    }
    setId(null);
    setModel('emoji');
    setExpression('neutral');
    setBackgroundColor(defaultBackgroundColor);
    setEmojiColor(defaultEmojiColor);
    setShowSunglasses(false);
    setShowMustache(false);
    setSelectedFilter(null);
    setAnimationType('random');
    setShape('default');
    setEyeStyle('default');
    setMouthStyle('default');
    setEyebrowStyle('default');
    feature_offset_x.set(0);
    feature_offset_y.set(0);
    setCaption('');
    setActiveMenu('main');
  };
  
  const handleRandomize = () => {
    const allExpressions: Expression[] = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'scared', 'love'];
    const newExpression = allExpressions[Math.floor(Math.random() * allExpressions.length)];
    setExpression(newExpression);
  }

  const handleSave = async () => {
    if (!user || !supabase) {
        toast({ title: 'You must be logged in to save', variant: 'destructive' });
        return;
    }
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!user || !supabase) return;
    
    setIsSaving(true);
    setShowSaveConfirm(false);

    const emojiData: Omit<EmojiState, 'id' | 'created_at' | 'user' | 'clay_width' | 'clay_height'> = {
        user_id: user.id,
        model,
        expression,
        background_color,
        emoji_color,
        show_sunglasses,
        show_mustache,
        selected_filter: selected_filter === 'None' ? null : selected_filter,
        animation_type,
        shape,
        eye_style,
        mouth_style,
        eyebrow_style,
        feature_offset_x: feature_offset_x.get(),
        feature_offset_y: feature_offset_y.get(),
        caption,
    };
    
    try {
        let result;
        if (id) {
            // Update existing emoji
            result = await supabase.from('emojis').update(emojiData).eq('id', id).select().single();
        } else {
            // Insert new emoji
            result = await supabase.from('emojis').insert(emojiData).select().single();
        }
        
        const { data, error } = result;

        if (error) {
            console.error('Failed to save emoji to Supabase:', error);
            toast({
                title: 'Error Saving',
                description: error.message || 'An unknown database error occurred.',
                variant: 'destructive',
            });
        } else if (data) {
            setId(data.id); // Set new ID if it was an insert
            toast({
                title: 'Creation Saved!',
                description: 'Your emoji has been successfully saved to your gallery.',
                variant: 'success',
            });
            router.replace(`/design?emojiId=${data.id}`, undefined);
        }
    } catch (error: any) {
        console.error('An unexpected error occurred during save:', error);
        toast({
            title: 'Error Saving',
            description: error.message || 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
};

  const handlePanStart = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    setIsDragging(true);
    dragOrigin.current = { x: feature_offset_x.get(), y: feature_offset_y.get() };
  };

  const handlePan = (_: any, info: any) => {
    if (dragOrigin.current) {
        const boundaryX = model === 'emoji' ? 80 : 40; 
        const boundaryY = model === 'emoji' ? 60 : 30;
        
        let newX = dragOrigin.current.x + info.offset.x;
        let newY = dragOrigin.current.y + info.offset.y;

        if ((newX**2 / boundaryX**2) + (newY**2 / boundaryY**2) > 1) {
            const angle = Math.atan2(newY, newX);
            const a = boundaryX;
            const b = boundaryY;
            newX = a * b / Math.sqrt(b**2 + a**2 * Math.tan(angle)**2) * (newX > 0 ? 1 : -1);
            newY = newX * Math.tan(angle);
        }

        feature_offset_x.set(newX);
        feature_offset_y.set(newY);
    }
  };

  const handlePanEnd = () => {
    dragOrigin.current = null;
    if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
    }
    dragTimeoutRef.current = setTimeout(() => {
        setIsDragging(false);
    }, 2000);
  };
  
  const handleModelChange = (newModel: ModelType) => {
    if (model === newModel) return;

    // Reset all common properties to their defaults for a clean slate
    setExpression('neutral');
    setShape('default');
    setEyeStyle('default');
    setMouthStyle('default');
    setEyebrowStyle('default');
    setShowSunglasses(false);
    setShowMustache(false);
    feature_offset_x.set(0);
    feature_offset_y.set(0);
    setSelectedFilter(null);
    setAnimationType(newModel === 'creator' ? 'none' : 'random'); // Set animation to none for creator
    setCaption('');
    
    // Set model-specific defaults
    if (newModel === 'loki') {
        setEmojiColor(defaultLokiColor);
    } else if (newModel === 'rimuru') {
        setEmojiColor(defaultRimuruColor);
    } else if (newModel === 'creator') {
        setEmojiColor(defaultCreatorColor);
        // Ensure no expression is shown initially for the creator model
        setExpression('neutral');
    }
    else {
        setEmojiColor(defaultEmojiColor);
    }

    // Finally, set the new model
    setModel(newModel);
  }

  const renderModel = () => {
    const faceProps = {
        expression: expression,
        show_sunglasses: show_sunglasses,
        show_mustache: show_mustache,
        shape: shape,
        eye_style: eye_style,
        mouth_style: mouth_style,
        eyebrow_style: eyebrow_style,
        animation_type: animation_type,
        isDragging: isDragging,
        isInteractive: true,
        onPan: handlePan,
        onPanStart: handlePanStart,
        onPanEnd: handlePanEnd,
        feature_offset_x: feature_offset_x,
        feature_offset_y: feature_offset_y,
        clay_width: 0,
        clay_height: 0,
    };

    switch(model) {
        case 'emoji':
            return <Face color={emoji_color} setColor={setEmojiColor} {...faceProps} />;
        case 'loki':
            return <ClockFace color={emoji_color} setColor={setEmojiColor} {...faceProps} />;
        case 'rimuru':
            return <RimuruFace color={emoji_color} setColor={setEmojiColor} {...faceProps} />;
        case 'creator':
            return <CreatorMoji color={emoji_color} setColor={setEmojiColor} {...faceProps} />;
    }
  }

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
  const activeFilterCss = filters.find(f => f.name === selected_filter)?.css || 'none';

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div 
          className="relative flex h-full w-full flex-col md:flex-row-reverse touch-none transition-colors duration-300"
          style={{ backgroundColor: background_color }}
      >
        <DesignToolbar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          expression={expression}
          setExpression={setExpression}
          background_color={background_color}
          setBackgroundColor={setBackgroundColor}
          emoji_color={emoji_color}
          setEmojiColor={setEmojiColor}
          show_sunglasses={show_sunglasses}
          setShowSunglasses={setShowSunglasses}
          show_mustache={show_mustache}
          setShowMustache={setShowMustache}
          selected_filter={selected_filter}
          setSelectedFilter={setSelectedFilter}
          filters={filters}
          animation_type={animation_type}
          setAnimationType={setAnimationType}
          shape={shape}
          setShape={setShape}
          model={model}
          eye_style={eye_style}
          setEyeStyle={setEyeStyle}
          mouth_style={mouth_style}
          setMouthStyle={setMouthStyle}
          eyebrow_style={eyebrow_style}
          setEyebrowStyle={setEyebrowStyle}
          caption={caption}
          setCaption={setCaption}
          handleReset={() => handleReset(true)}
          handleSave={handleSave}
          handleRandomize={handleRandomize}
        />

        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative">
            <div className="absolute top-4 left-4 z-20 bg-background/50 backdrop-blur-sm p-1 rounded-lg flex items-center gap-1">
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button 
                          size="icon" 
                          variant={model === 'emoji' ? 'secondary' : 'ghost'}
                          onClick={() => handleModelChange('emoji')}
                      >
                          <Users className="h-5 w-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Emoji Model</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button 
                          size="icon" 
                          variant={model === 'loki' ? 'secondary' : 'ghost'}
                          onClick={() => handleModelChange('loki')}
                      >
                          <Clock className="h-5 w-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Loki Clock Model</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button
                          size="icon"
                          variant={model === 'rimuru' ? 'secondary' : 'ghost'}
                          onClick={() => handleModelChange('rimuru')}
                      >
                          <Droplet className="h-5 w-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Rimuru Slime Model</p></TooltipContent>
              </Tooltip>
            </div>
            
            <div className="absolute top-4 right-4 z-20">
                 <Button variant="outline" size="sm" onClick={() => handleModelChange('creator')} className="bg-white text-black hover:bg-white/90">
                    Create
                </Button>
            </div>

          <motion.div
            className="w-80 h-96 flex items-center justify-center select-none"
            style={{ 
              transformStyle: 'preserve-3d',
              filter: activeFilterCss,
            }}
          >
            {renderModel()}
          </motion.div>
        </div>


        <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Save</AlertDialogTitle>
                    <AlertDialogDescription>
                        {id ? 'This will overwrite your existing creation. Are you sure?' : 'Do you want to save this new creation to your gallery?'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Save'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
      </div>
    </TooltipProvider>
  );
}

export default function DesignPage() {
    return (
      <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <DesignPageContent />
      </Suspense>
    );
}
