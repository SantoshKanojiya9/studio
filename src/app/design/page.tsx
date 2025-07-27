
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
  LayoutTemplate,
  Type,
  Component,
  ImageUp,
  Layers,
  Image as ImageIcon,
  Sparkles,
  PenTool,
  FlipVertical,
  ArrowLeft,
  Heading1,
  Heading2,
  CaseSensitive,
  Square,
  Search,
  Paintbrush,
  Palette,
} from 'lucide-react';
import Image from 'next/image';

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
      { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
      { id: 'text', icon: Type, label: 'Text' },
      { id: 'elements', icon: Component, label: 'Elements' },
      { id: 'uploads', icon: ImageUp, label: 'Uploads' },
      { id: 'overlap', icon: Layers, label: 'Overlap' },
      { id: 'photos', icon: ImageIcon, label: 'Photos' },
      { id: 'ai', icon: Sparkles, label: 'AI' },
      { id: 'draw', icon: PenTool, label: 'Draw' },
      { id: 'background', icon: FlipVertical, label: 'Background' },
    ],
  },
  templates: {
    label: 'Templates',
    tools: [
      { id: 't-1', icon: LayoutTemplate, label: 'Template 1', image: 'https://placehold.co/600x400.png', hint: 'template design' },
      { id: 't-2', icon: LayoutTemplate, label: 'Template 2', image: 'https://placehold.co/400x600.png', hint: 'template design' },
      { id: 't-3', icon: LayoutTemplate, label: 'Template 3', image: 'https://placehold.co/600x600.png', hint: 'template design' },
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
  photos: {
    label: 'Photos',
    tools: [{ id: 'search-photos', icon: Search, label: 'Search Photos', image: 'https://placehold.co/600x400.png', hint: 'landscape photo' }],
  },
  ai: {
    label: 'AI',
    tools: [{ id: 'ai-generate', icon: Sparkles, label: 'Generate', image: 'https://placehold.co/600x400.png', hint: 'abstract art' }],
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
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [canvasImageHint, setCanvasImageHint] = useState<string>('canvas');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCanvasImage(e.target?.result as string);
        setCanvasImageHint('uploaded image');
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
      // It's a sub-tool, find it and set the image
      const parentToolKey = activeTool as keyof typeof toolConfig;
      const subTool = toolConfig[parentToolKey]?.tools.find(t => t.id === toolId);
      if (subTool && subTool.image) {
        setCanvasImage(subTool.image);
        setCanvasImageHint(subTool.hint || 'design element');
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
        <div className="w-full h-full max-w-full max-h-full aspect-square bg-white rounded-md shadow-lg flex items-center justify-center overflow-hidden">
          {canvasImage ? (
            <div className="relative w-full h-full">
                <Image
                    src={canvasImage}
                    alt="Canvas content"
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint={canvasImageHint}
                />
            </div>
          ) : (
            <p className="text-zinc-400 text-lg">Your Canvas</p>
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
          <CarouselContent className="ml-0">
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
                  disabled={tool.id === 'overlap' && !canvasImage}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </footer>
    </div>
  );
}
