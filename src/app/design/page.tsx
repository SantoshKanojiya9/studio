
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import {
  X,
  ChevronDown,
  Save,
  Scaling,
  Type,
  Component,
  ImageUp,
  Layers,
  PenTool,
  FlipVertical,
  ArrowLeft,
  Heading1,
  Heading2,
  CaseSensitive,
  Square,
  Paintbrush,
  Palette,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const EditorButton = ({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Button
    variant="ghost"
    className="flex flex-col items-center justify-center h-auto text-xs text-muted-foreground p-2 w-full hover:bg-transparent hover:text-primary disabled:opacity-50 disabled:pointer-events-none"
    onClick={onClick}
    disabled={disabled}
  >
    <Icon className="h-6 w-6 mb-1" />
    <span>{label}</span>
  </Button>
);

const toolConfig = {
  main: {
    label: 'Main',
    tools: [
      { id: 'canvas', icon: Scaling, label: 'Canvas' },
      { id: 'text', icon: Type, label: 'Text' },
      { id: 'elements', icon: Component, label: 'Elements' },
      { id: 'uploads', icon: ImageUp, label: 'Uploads' },
      { id: 'overlap', icon: Layers, label: 'Overlap' },
      { id: 'draw', icon: PenTool, label: 'Draw' },
      { id: 'background', icon: FlipVertical, label: 'Background' },
    ],
  },
  canvas: {
    label: 'Canvas',
    tools: [
      { id: 'c-1', icon: Square, label: 'Square', image: 'https://placehold.co/600x600.png', hint: 'square canvas' },
      { id: 'c-2', icon: FlipVertical, label: 'Portrait', image: 'https://placehold.co/400x600.png', hint: 'portrait canvas' },
      { id: 'c-3', icon: FlipVertical, label: 'Landscape', image: 'https://placehold.co/600x400.png', hint: 'landscape canvas' },
      { id: 'c-4', icon: FlipVertical, label: 'Story', image: 'https://placehold.co/1080x1920.png', hint: 'story canvas' },
      { id: 'c-5', icon: FlipVertical, label: 'Wide', image: 'https://placehold.co/800x400.png', hint: 'wide canvas' },
      { id: 'c-6', icon: FlipVertical, label: 'Tall', image: 'https://placehold.co/400x800.png', hint: 'tall canvas' },
      { id: 'c-7', icon: Square, label: 'Large Square', image: 'https://placehold.co/800x800.png', hint: 'large square' },
    ],
  },
  text: {
    label: 'Text',
    tools: [
      { id: 'heading', icon: Heading1, label: 'Heading', image: 'https://placehold.co/600x400.png', hint: 'text heading' },
      { id: 'subheading', icon: Heading2, label: 'Subheading', image: 'https://placehold.co/600x400.png', hint: 'text subheading' },
      { id: 'body', icon: Type, label: 'Body Text', image: 'https://placehold.co/600x400.png', hint: 'body text' },
      { id: 'textbox', icon: CaseSensitive, label: 'Textbox', image: 'https://placehold.co/600x400.png', hint: 'text box' },
    ],
  },
  elements: {
    label: 'Elements',
    tools: [{ id: 'shape', icon: Square, label: 'Shape', image: 'https://placehold.co/200x200.png', hint: 'geometric shape' }],
  },
  uploads: {
    label: 'Uploads',
    tools: [],
  },
  overlap: {
    label: 'Overlap',
    tools: [{ id: 'l-1', icon: Layers, label: 'Layer 1' }],
  },
  draw: {
    label: 'Draw',
    tools: [{ id: 'pen-tool', icon: Paintbrush, label: 'Pen', image: 'https://placehold.co/600x400.png', hint: 'drawing tools' }],
  },
  background: {
    label: 'Background',
    tools: [{ id: 'bg-color', icon: Palette, label: 'Color', image: 'https://placehold.co/600x400.png', hint: 'color palette' }],
  },
};


type ToolId = keyof typeof toolConfig;

export default function DesignPage() {
  const [activeTool, setActiveTool] = useState<ToolId>('main');
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasAspectRatio, setCanvasAspectRatio] = useState<number>(1);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        if (!templateImage) {
            setTemplateImage('https://placehold.co/600x400.png'); 
             setCanvasAspectRatio(600/400);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleToolClick = (toolId: string) => {
    if (toolId === 'uploads') {
      triggerFileSelect();
      return;
    }

    if (toolId in toolConfig) {
      setActiveTool(toolId as ToolId);
    } else {
      const parentToolKey = activeTool as keyof typeof toolConfig;
      const subTool = toolConfig[parentToolKey]?.tools.find(t => t.id === toolId);
      if (subTool && subTool.image) {
        setTemplateImage(subTool.image);
        const match = subTool.image.match(/placehold\.co\/(\d+)x(\d+)/);
        if (match) {
            const width = parseInt(match[1], 10);
            const height = parseInt(match[2], 10);
            setCanvasAspectRatio(width / height);
        }
      }
    }
  };

  const handleBackClick = () => {
    setActiveTool('main');
  };

  const currentTools = toolConfig[activeTool].tools;

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      {/* Top Bar */}
      <header className="flex items-center justify-between p-2 bg-zinc-950">
        <Button variant="ghost" size="icon">
          <X className="h-5 w-5" />
        </Button>
        <Button variant="ghost" className="flex items-center gap-1">
          <span className="text-sm font-medium">Untitled Design</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Save className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content - Canvas */}
       <main className="flex-1 flex items-center justify-center p-4 bg-zinc-800">
        <div 
            className="w-full h-full max-w-full max-h-full bg-white rounded-md shadow-lg flex items-center justify-center overflow-hidden relative"
            style={{ aspectRatio: canvasAspectRatio }}
        >
          {templateImage ? (
             <Image
                src={templateImage}
                alt="Template background"
                layout="fill"
                objectFit="cover"
                data-ai-hint="template background"
            />
          ) : (
             !uploadedImage && <p className="text-zinc-400 text-lg">Your Canvas</p>
          )}
          {uploadedImage && (
            <div className="absolute inset-0 p-8">
                 <div className="relative w-full h-full">
                    <Image
                        src={uploadedImage}
                        alt="Uploaded content"
                        layout="fill"
                        objectFit="contain"
                        data-ai-hint="uploaded image"
                    />
                </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Toolbar */}
      <footer className="bg-zinc-950 border-t border-zinc-800 p-2">
        <Carousel
          opts={{
            align: 'start',
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent>
             {activeTool !== 'main' && (
              <CarouselItem className="pl-2 basis-auto">
                <EditorButton
                  icon={ArrowLeft}
                  label="Back"
                  onClick={handleBackClick}
                />
              </CarouselItem>
            )}
            {currentTools.map((tool) => (
              <CarouselItem key={tool.id} className="pl-2 basis-auto">
                <EditorButton
                  icon={tool.icon}
                  label={tool.label}
                  onClick={() => handleToolClick(tool.id)}
                  disabled={tool.id === 'overlap' && !uploadedImage}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </footer>
    </div>
  );
}
