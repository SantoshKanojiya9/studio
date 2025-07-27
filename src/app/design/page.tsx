
'use client';

import { Button } from '@/components/ui/button';
import {
  X,
  ChevronDown,
  Upload,
  Maximize,
  Play,
  Undo,
  Redo,
  VolumeX,
  FileImage,
  Plus,
  Scissors,
  Music,
  Type,
  Layers,
  Sparkles,
  Crop,
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
    <div className="flex flex-col h-full bg-black text-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 bg-zinc-900/80">
        <Button variant="ghost" size="icon">
          <X className="h-6 w-6" />
        </Button>
        <Button variant="ghost" className="flex items-center gap-1">
          <span className="text-sm font-medium">1080P</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Upload className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Content - Video Preview */}
      <main className="flex-1 flex items-center justify-center p-4 bg-black">
        <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center rounded-md">
            {/* Placeholder for video player */}
        </div>
      </main>

      {/* Timeline Controls */}
      <div className="p-4 space-y-4 bg-zinc-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Maximize className="h-5 w-5" />
            </Button>
            <div className="text-xs font-mono">00:00 / 00:10</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Play className="h-7 w-7" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Undo className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Redo className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative h-20 w-full flex items-center">
            <div className="absolute w-0.5 h-full bg-white left-1/2 -translate-x-1/2 z-10"></div>
            <div className="w-full h-14 bg-zinc-800 rounded-lg flex items-center px-4 gap-2">
                <div className="flex flex-col gap-1 items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <VolumeX className="h-4 w-4" />
                    </Button>
                    <span className="text-xs">Mute</span>
                </div>
                 <div className="flex flex-col gap-1 items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileImage className="h-4 w-4" />
                    </Button>
                    <span className="text-xs">Cover</span>
                </div>
                <div className="flex-1 h-full flex items-center text-sm text-muted-foreground pl-4">
                    <Plus className="h-4 w-4 mr-2" /> Add audio
                </div>
                <Button size="icon" className="bg-white text-black hover:bg-zinc-200">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <footer className="flex items-center justify-around p-2 bg-zinc-900/80 border-t border-zinc-800">
        <EditorButton icon={Scissors} label="Edit" />
        <EditorButton icon={Music} label="Audio" />
        <EditorButton icon={Type} label="Text" />
        <EditorButton icon={Layers} label="Overlay" />
        <EditorButton icon={Sparkles} label="Effects" />
        <EditorButton icon={Crop} label="Ratio" />
      </footer>
    </div>
  );
}
