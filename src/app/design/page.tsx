
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import {
  X,
  ChevronDown,
  Upload,
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
} from 'lucide-react';

const EditorButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) => (
  <Button
    variant="ghost"
    className="flex flex-col items-center justify-center h-auto text-xs text-muted-foreground p-2 w-full hover:bg-transparent hover:text-primary"
    onClick={onClick}
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
      { id: 'layers', icon: Layers, label: 'Overlap' },
      { id: 'photos', icon: ImageIcon, label: 'Photos' },
      { id: 'ai', icon: Sparkles, label: 'AI' },
      { id: 'draw', icon: PenTool, label: 'Draw' },
      { id: 'background', icon: FlipVertical, label: 'Background' },
    ],
  },
  templates: {
    label: 'Templates',
    tools: [
      { id: 't-1', icon: LayoutTemplate, label: 'Template 1' },
      { id: 't-2', icon: LayoutTemplate, label: 'Template 2' },
      { id: 't-3', icon: LayoutTemplate, label: 'Template 3' },
    ],
  },
  text: {
    label: 'Text',
    tools: [
      { id: 'heading', icon: Heading1, label: 'Heading' },
      { id: 'subheading', icon: Heading2, label: 'Subheading' },
      { id: 'body', icon: Type, label: 'Body Text' },
      { id: 'textbox', icon: CaseSensitive, label: 'Textbox' },
    ],
  },
  elements: {
    label: 'Elements',
    tools: [{ id: 'e-1', icon: Component, label: 'Shape' }],
  },
  uploads: {
    label: 'Uploads',
    tools: [{ id: 'u-1', icon: ImageUp, label: 'Upload File' }],
  },
  layers: {
    label: 'Overlap',
    tools: [{ id: 'l-1', icon: Layers, label: 'Layer 1' }],
  },
  photos: {
    label: 'Photos',
    tools: [{ id: 'p-1', icon: ImageIcon, label: 'Search Photos' }],
  },
  ai: {
    label: 'AI',
    tools: [{ id: 'a-1', icon: Sparkles, label: 'Generate' }],
  },
  draw: {
    label: 'Draw',
    tools: [{ id: 'd-1', icon: PenTool, label: 'Pen' }],
  },
  background: {
    label: 'Background',
    tools: [{ id: 'b-1', icon: FlipVertical, label: 'Color' }],
  },
};


type ToolId = keyof typeof toolConfig;

export default function DesignPage() {
  const [activeTool, setActiveTool] = useState<ToolId>('main');

  const handleToolClick = (toolId: string) => {
    if (toolId in toolConfig) {
      setActiveTool(toolId as ToolId);
    }
  };

  const handleBackClick = () => {
    setActiveTool('main');
  };

  const currentTools = toolConfig[activeTool].tools;

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
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
          <Upload className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content - Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 bg-zinc-800">
        <div className="w-full h-full max-w-full max-h-full aspect-square bg-white rounded-md shadow-lg flex items-center justify-center">
          {/* Placeholder for canvas content */}
          <p className="text-zinc-400 text-lg">Your Canvas</p>
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
          <CarouselContent className="-ml-0">
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
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </footer>
    </div>
  );
}
