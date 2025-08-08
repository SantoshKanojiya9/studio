
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { motion, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Sparkles, Glasses, Palette, Wand2, ArrowLeft, Smile, Frown, Heart, Ghost, Paintbrush, Pipette, Camera, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, ArrowUpLeft, Square, User as UserIcon, Eye, Meh, ChevronsRight, Save, Users, Clock, Loader2, Captions } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSearchParams, useRouter } from 'next/navigation';
import { Face } from '@/components/emoji-face';
import { ClockFace } from '@/components/loki-face';
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


export type Expression = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'scared' | 'love';
type MenuType = 'main' | 'expressions' | 'colors' | 'accessories' | 'filters' | 'animations' | 'shapes' | 'face' | 'eyes' | 'mouth' | 'eyebrows' | 'caption';
export type AnimationType = 'left-right' | 'right-left' | 'up-down' | 'down-up' | 'diag-left-right' | 'diag-right-left' | 'random' | 'none';
export type ShapeType = 'default' | 'square' | 'squircle' | 'tear' | 'blob';
export type FeatureStyle = 'default' | 'male-1' | 'male-2' | 'male-3' | 'female-1' | 'female-2' | 'female-3';
type ModelType = 'emoji' | 'loki';


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
  
  const emojiId = searchParams.get('emojiId');
  const [id, setId] = useState<string | null>(emojiId);
  const [isLoading, setIsLoading] = useState(!!emojiId);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
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
  
  const dragOrigin = useRef<{ x: number, y: number } | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feature_offset_x = useMotionValue(0);
  const feature_offset_y = useMotionValue(0);

  useEffect(() => {
    const loadEmojiData = async () => {
        if (!emojiId || !supabase) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('emojis')
                .select('*')
                .eq('id', emojiId)
                .single();

            if (error) throw error;
            if (data) {
                // Load data into state
                setId(data.id);
                setModel(data.model);
                setExpression(data.expression);
                setBackgroundColor(data.background_color);
                setEmojiColor(data.emoji_color);
                setShowSunglasses(data.show_sunglasses);
                setShowMustache(data.show_mustache);
                setSelectedFilter(data.selected_filter);
                setAnimationType(data.animation_type);
                setShape(data.shape);
                setEyeStyle(data.eye_style);
                setMouthStyle(data.mouth_style);
                setEyebrowStyle(data.eyebrow_style);
                feature_offset_x.set(data.feature_offset_x);
                feature_offset_y.set(data.feature_offset_y);
                setCaption(data.caption || '');
            }
        } catch (error: any) {
            console.error('Failed to load emoji data:', error);
            toast({
                title: 'Error loading creation',
                description: 'Could not load the specified emoji. Starting a new one.',
                variant: 'destructive',
            });
            handleReset(); // Reset if loading fails
        } finally {
            setIsLoading(false);
        }
    };

    if (emojiId) {
        loadEmojiData();
    } else {
        handleReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emojiId, supabase]);

  
  const handleReset = () => {
    router.replace('/design', undefined);
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

    const emojiData: Omit<EmojiState, 'id' | 'created_at' | 'user'> = {
        user_id: user.id, // Explicitly set the user_id
        model,
        expression,
        background_color,
        emoji_color,
        show_sunglasses,
        show_mustache,
        selected_filter,
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
  
  const filters = [
    { name: 'None', style: {} },
    { name: 'Sepia', style: { background: 'linear-gradient(to right, #704214, #EAE0C8)' } },
    { name: 'Grayscale', style: { background: 'linear-gradient(to right, #333, #ccc)' } },
    { name: 'Invert', style: { background: 'linear-gradient(to right, #f00, #0ff)' } },
    { name: 'Hue-Rotate', style: { background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' } },
    { name: 'Contrast', style: { background: 'linear-gradient(to right, #000, #fff)' } },
    { name: 'Saturate', style: { background: 'linear-gradient(to right, gray, red)' } },
    { name: 'Vintage', style: { background: 'linear-gradient(to right, #6d5a4c, #d5c8b8)' } },
    { name: 'Cool', style: { background: 'linear-gradient(to right, #3a7bd5, #00d2ff)' } },
    { name: 'Warm', style: { background: 'linear-gradient(to right, #f7b733, #fc4a1a)' } },
  ];

  const handleFilterSelect = (filterName: string) => {
    if (selected_filter === filterName) {
      setSelectedFilter(null); // Deselect
    } else {
      setSelectedFilter(filterName);
    }
  };

  const handleExpressionToggle = (newExpression: Expression) => {
    setExpression(newExpression);
  };
  
  const handleShapeToggle = (newShape: ShapeType) => {
    if (shape === newShape) {
      setShape('default');
    } else {
      setShape(newShape);
    }
  };

  const handleFeatureSelect = (
    type: 'eye' | 'mouth' | 'eyebrow', 
    style: FeatureStyle
  ) => {
    if (type === 'eye') {
        setEyeStyle(prev => prev === style ? 'default' : style);
    } else if (type === 'mouth') {
        setMouthStyle(prev => prev === style ? 'default' : style);
    } else {
        setEyebrowStyle(prev => prev === style ? 'default' : style);
    }
  };

  const renderFeatureMenu = (
    type: 'eye' | 'mouth' | 'eyebrow', 
    currentStyle: FeatureStyle
  ) => {
    const featureStyles: {name: FeatureStyle, label: string}[] = [
        {name: 'male-1', label: 'Style 1'},
        {name: 'male-2', label: 'Style 2'},
        {name: 'male-3', label: 'Style 3'},
        {name: 'female-1', label: 'Style 4'},
        {name: 'female-2', label: 'Style 5'},
        {name: 'female-3', label: 'Style 6'},
    ];

    const title = type.charAt(0).toUpperCase() + type.slice(1);

    return (
        <div className="flex items-center w-full">
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('face')} className="flex-shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2 flex-shrink-0" />
            <span className="font-semibold text-sm mr-4">{title}</span>
             <div className="flex-1 flex items-center gap-2 overflow-x-auto pr-4">
                {featureStyles.map(style => (
                    <Tooltip key={style.name}>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={currentStyle === style.name ? 'default' : 'outline'}
                                onClick={() => handleFeatureSelect(type, style.name)}
                            >
                                {style.label}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{style.label}</p></TooltipContent>
                    </Tooltip>
                ))}
             </div>
        </div>
    )
  }
  
  const handleModelChange = (newModel: ModelType) => {
    if (model === newModel) return;
    setModel(newModel);
    
    if (newModel === 'loki') {
        setEmojiColor(defaultLokiColor);
        if (shape === 'blob') {
            setShape('default');
        }
    } else {
        setEmojiColor(defaultEmojiColor);
    }
  }

  const renderMenu = () => {
    const isLoki = model === 'loki';
    switch (activeMenu) {
      case 'caption':
        return (
          <div className="flex items-center w-full p-2">
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')} className="flex-shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2 flex-shrink-0" />
            <div className="relative w-full">
                 <Textarea 
                    id="caption"
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={30}
                    className="pr-12 h-10 resize-none text-sm"
                    rows={1}
                 />
                 <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {caption.length}/30
                 </div>
            </div>
          </div>
        )
      case 'expressions':
        return (
          <>
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Tooltip><TooltipTrigger asChild><Button variant={expression === 'happy' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleExpressionToggle('happy')}><Smile className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Happy</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={expression === 'sad' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleExpressionToggle('sad')}><Frown className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Sad</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={expression === 'scared' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleExpressionToggle('scared')}><Ghost className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Scared</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant={expression === 'love' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleExpressionToggle('love')}><Heart className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Love</p></TooltipContent></Tooltip>
          </>
        );
      case 'shapes':
        const shapes: { name: ShapeType; label: string }[] = isLoki 
        ? [
            { name: 'default', label: 'Default' },
            { name: 'square', label: 'Square' },
            { name: 'squircle', label: 'Squircle' },
            { name: 'tear', label: 'Tear' },
        ]
        : [
          { name: 'default', label: 'Default' },
          { name: 'square', label: 'Square' },
          { name: 'squircle', label: 'Squircle' },
          { name: 'tear', label: 'Tear' },
          { name: 'blob', label: 'Blob' },
        ];
        return (
          <>
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            {shapes.map(({ name, label }) => (
                <Tooltip key={name}>
                    <TooltipTrigger asChild>
                        <Button variant={shape === name ? 'secondary' : 'ghost'} onClick={() => handleShapeToggle(name)}>
                            {label}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{label}</p></TooltipContent>
                </Tooltip>
            ))}
          </>
        );
      case 'colors':
        return (
          <>
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="bg-color-input" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}))}>
                        <Paintbrush className="h-4 w-4"/>
                        <Input id="bg-color-input" type="color" value={background_color} onChange={(e) => setBackgroundColor(e.target.value)} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Background Color</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="face-color-input" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}))}>
                        <Pipette className="h-4 w-4"/>
                        <Input id="face-color-input" type="color" value={emoji_color} onChange={(e) => setEmojiColor(e.target.value)} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Face Color</p></TooltipContent>
            </Tooltip>
          </>
        );
      case 'accessories':
        return (
          <>
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="sunglasses-switch" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}), "flex items-center gap-2 cursor-pointer", show_sunglasses && "bg-accent text-accent-foreground")}>
                        <Glasses className="h-4 w-4" />
                        <Switch id="sunglasses-switch" checked={show_sunglasses} onCheckedChange={setShowSunglasses} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Toggle Sunglasses</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Label htmlFor="mustache-switch" className={cn(buttonVariants({variant: 'ghost', size: 'icon'}), "flex items-center gap-2 cursor-pointer", show_mustache && "bg-accent text-accent-foreground")}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.25,12.05c0,5.65-4.14,7.2-9.25,7.2S3.75,17.7,3.75,12.05c0-4.06,2.23-5.23,3.73-6.23C8.5,5,9.5,2,13,2s4.5,3,5.5,3.82C20,6.82,22.25,7.99,22.25,12.05Z"/></svg>
                        <Switch id="mustache-switch" checked={show_mustache} onCheckedChange={setShowMustache} className="sr-only" />
                    </Label>
                </TooltipTrigger>
                <TooltipContent><p>Toggle Mustache</p></TooltipContent>
            </Tooltip>
          </>
        );
      case 'filters':
        return (
            <div className="flex items-center w-full">
                <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')} className="flex-shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-6 mx-2 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-3 overflow-x-auto pr-4">
                    {filters.map(filter => (
                        <Tooltip key={filter.name}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => handleFilterSelect(filter.name)}
                                    className={cn(
                                        "w-12 h-12 rounded-lg flex-shrink-0 border-2 transition-all duration-200",
                                        selected_filter === filter.name ? 'border-primary scale-110' : 'border-border'
                                    )}
                                >
                                    <div className="w-full h-full rounded-md" style={filter.style}></div>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent><p>{filter.name}</p></TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>
        );
        case 'animations':
             const animations: { name: AnimationType, icon: React.ElementType, label: string }[] = [
                { name: 'left-right', icon: ArrowRight, label: 'L-R' },
                { name: 'right-left', icon: ArrowLeft, label: 'R-L' },
                { name: 'up-down', icon: ArrowDown, label: 'U-D' },
                { name: 'down-up', icon: ArrowUp, label: 'D-U' },
                { name: 'diag-left-right', icon: ArrowUpRight, label: 'Diag L-R' },
                { name: 'diag-right-left', icon: ArrowUpLeft, label: 'Diag R-L' },
                { name: 'random', icon: Wand2, label: 'Random' },
            ];
            return (
                <div className="flex items-center w-full">
                    <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <div className="flex-1 flex items-center gap-2 overflow-x-auto pr-4">
                        {animations.map(({name, icon: Icon, label}) => (
                            <Tooltip key={name}>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant={animation_type === name ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setAnimationType(prev => prev === name ? 'none' : name)}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{label}</p></TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            );
      case 'face':
        return (
            <>
                <Button variant="ghost" size="icon" onClick={() => setActiveMenu('main')}><ArrowLeft className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button variant="ghost" onClick={() => setActiveMenu('eyes')}><Eye className="mr-2 h-4 w-4" /> Eyes</Button>
                <Button variant="ghost" onClick={() => setActiveMenu('mouth')}><Meh className="mr-2 h-4 w-4" /> Mouth</Button>
                <Button variant="ghost" onClick={() => setActiveMenu('eyebrows')}><ChevronsRight className="mr-2 h-4 w-4" style={{transform: 'rotate(-45deg)'}} /> Eyebrows</Button>
            </>
        )
      case 'eyes':
        return renderFeatureMenu('eye', eye_style);
      case 'mouth':
        return renderFeatureMenu('mouth', mouth_style);
      case 'eyebrows':
        return renderFeatureMenu('eyebrow', eyebrow_style);
      default: // 'main'
        return (
          <>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                <span className="text-xs mt-1">New</span>
            </Button>
             <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={handleSave}>
                <Save className="h-4 w-4" />
                <span className="text-xs mt-1">Save</span>
            </Button>
            <Separator orientation="vertical" className="h-full mx-1" />
             <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('caption')}>
                <Captions className="h-4 w-4" />
                <span className="text-xs mt-1">Caption</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('expressions')}>
                <Smile className="h-4 w-4" />
                <span className="text-xs mt-1">Expressions</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('face')}>
                <UserIcon className="h-4 w-4" />
                <span className="text-xs mt-1">Face</span>
            </Button>
             <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('animations')}>
                <Sparkles className="h-4 w-4" />
                <span className="text-xs mt-1">Animations</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('shapes')}>
                <Square className="h-4 w-4" />
                <span className="text-xs mt-1">Shapes</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('colors')}>
                <Palette className="h-4 w-4" />
                <span className="text-xs mt-1">Colors</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('accessories')} disabled={model === 'loki'}>
                <Glasses className="h-4 w-4" />
                <span className="text-xs mt-1">Accessories</span>
            </Button>
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={() => setActiveMenu('filters')}>
                <Camera className="h-4 w-4" />
                <span className="text-xs mt-1">Filters</span>
            </Button>
            <Separator orientation="vertical" className="h-full mx-1" />
            <Button variant="ghost" className="h-auto p-2 flex flex-col" onClick={handleRandomize}>
                <Wand2 className="h-4 w-4" />
                <span className="text-xs mt-1">Random</span>
            </Button>
          </>
        );
    }
  };

  if (isLoading) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <TooltipProvider>
      <div 
          className="flex h-full w-full flex-col overflow-hidden touch-none transition-colors duration-300"
          style={{ backgroundColor: background_color }}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative">
          {/* Model Switcher */}
          <div className="absolute top-4 right-4 z-20 bg-background/50 backdrop-blur-sm p-1 rounded-lg flex items-center gap-1">
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
          </div>
          
          <motion.div
            className="w-80 h-96 flex items-center justify-center select-none"
            style={{ 
              transformStyle: 'preserve-3d',
              filter: selected_filter && selected_filter !== 'None' ? `${selected_filter.toLowerCase().replace('-', '')}(1)` : 'none',
            }}
          >
            {model === 'emoji' ? (
                <Face 
                    expression={expression} 
                    color={emoji_color} 
                    setColor={setEmojiColor}
                    show_sunglasses={show_sunglasses} 
                    show_mustache={show_mustache} 
                    shape={shape}
                    eye_style={eye_style}
                    mouth_style={mouth_style}
                    eyebrow_style={eyebrow_style}
                    animation_type={animation_type}
                    isDragging={isDragging}
                    isInteractive={true}
                    onPan={handlePan}
                    onPanStart={handlePanStart}
                    onPanEnd={handlePanEnd}
                    feature_offset_x={feature_offset_x}
                    feature_offset_y={feature_offset_y}
                />
            ) : (
                <ClockFace 
                    expression={expression} 
                    color={emoji_color} 
                    setColor={setEmojiColor}
                    show_sunglasses={show_sunglasses} 
                    show_mustache={show_mustache} 
                    shape={shape}
                    eye_style={eye_style}
                    mouth_style={mouth_style}
                    eyebrow_style={eyebrow_style}
                    animation_type={animation_type}
                    isDragging={isDragging}
                    isInteractive={true}
                    onPan={handlePan}
                    onPanStart={handlePanStart}
                    onPanEnd={handlePanEnd}
                    feature_offset_x={feature_offset_x}
                    feature_offset_y={feature_offset_y}
                />
            )}
          </motion.div>
        </div>

        <div className="fixed bottom-[56px] left-0 right-0 z-20 w-full max-w-md mx-auto">
          <div className="flex flex-col bg-background/80 backdrop-blur-sm border-t border-border">
            <ScrollArea className="w-full whitespace-nowrap no-scrollbar">
                <div className="flex items-center justify-center w-max space-x-1 p-2 mx-auto h-16">
                    {renderMenu()}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>
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
      <React.Suspense fallback={<div>Loading...</div>}>
        <DesignPageContent />
      </React.Suspense>
    );
}
