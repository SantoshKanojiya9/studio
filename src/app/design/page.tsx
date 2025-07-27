
'use client';

import { Button } from '@/components/ui/button';
import {
  X,
  ChevronDown,
  Upload,
  LayoutTemplate,
  Type,
  Component,
  ImageUp,
  Layers,
} from 'lucide-react';

const EditorButton = ({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) => (
  <Button
    variant="ghost"
    className="flex flex-col items-center justify-center h-auto text-xs text-muted-foreground hover:text-primary p-2"
  >
    <Icon className="h-6 w-6 mb-1" />
    <span>{label}</span>
  </Button>
);

export default function DesignPage() {
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
      <footer className="flex items-center justify-around p-2 bg-zinc-950 border-t border-zinc-800">
        <EditorButton icon={LayoutTemplate} label="Templates" />
        <EditorButton icon={Type} label="Text" />
        <EditorButton icon={Component} label="Elements" />
        <EditorButton icon={ImageUp} label="Uploads" />
        <EditorButton icon={Layers} label="Layers" />
      </footer>
    </div>
  );
}
