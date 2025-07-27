
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Upload, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Filters = {
  brightness: number;
  contrast: number;
  saturate: number;
  blur: number;
};

const defaultFilters: Filters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
};

export default function DesignPage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (image && canvasRef.current && mainContentRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const container = mainContentRef.current;

      if (ctx) {
        // Calculate the best fit for the canvas within the container
        const containerWidth = container.clientWidth - 32; // subtract padding
        const containerHeight = container.clientHeight - 32; // subtract padding
        const imageAspectRatio = image.naturalWidth / image.naturalHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        let canvasWidth, canvasHeight;

        if (imageAspectRatio > containerAspectRatio) {
          canvasWidth = containerWidth;
          canvasHeight = containerWidth / imageAspectRatio;
        } else {
          canvasHeight = containerHeight;
          canvasWidth = containerHeight * imageAspectRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Apply CSS filters
        ctx.filter = `
          brightness(${filters.brightness}%) 
          contrast(${filters.contrast}%) 
          saturate(${filters.saturate}%) 
          blur(${filters.blur}px)
        `;
        
        // Draw the image scaled to fit the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
    }
  }, [image, filters]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setFilters(defaultFilters); // Reset filters for new image
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
      // Reset input value to allow uploading the same file again
      e.target.value = '';
    }
  };

  const handleSliderChange = (filterName: keyof Filters) => (value: number[]) => {
    setFilters(prev => ({ ...prev, [filterName]: value[0] }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const downloadImage = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Create a temporary canvas to draw the image at its natural resolution
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && image) {
        tempCanvas.width = image.naturalWidth;
        tempCanvas.height = image.naturalHeight;
        tempCtx.filter = `
          brightness(${filters.brightness}%) 
          contrast(${filters.contrast}%) 
          saturate(${filters.saturate}%) 
          blur(${filters.blur}px)
        `;
        tempCtx.drawImage(image, 0, 0);

        const link = document.createElement('a');
        link.download = 'enhanced-image.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const filterControls: { name: keyof Filters; label: string; min: number; max: number; step: number }[] = [
      { name: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1 },
      { name: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1 },
      { name: 'saturate', label: 'Saturation', min: 0, max: 200, step: 1 },
      { name: 'blur', label: 'Blur', min: 0, max: 10, step: 0.1 },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      <header className="flex items-center justify-between p-4 border-b border-zinc-700 flex-shrink-0">
        <h1 className="text-xl font-semibold">Image Enhancer</h1>
        <div className="flex items-center gap-2">
            <Button onClick={triggerFileUpload} variant="outline" className="bg-zinc-800 hover:bg-zinc-700 border-zinc-600">
                <Upload className="mr-2" />
                Upload Image
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />
             <Button onClick={downloadImage} disabled={!image} variant="default">
                <Download className="mr-2" />
                Download
            </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 flex items-center justify-center p-4 overflow-auto bg-zinc-800">
          {image ? (
            <canvas ref={canvasRef} />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-600 p-12 rounded-lg text-center">
              <Upload className="h-16 w-16 mb-4" />
              <h2 className="text-2xl font-semibold">Upload an image to start</h2>
              <p className="mt-2">Your images are processed locally in your browser.</p>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className={cn(
            "w-80 bg-zinc-900 border-l border-zinc-700 p-6 flex flex-col gap-6 overflow-y-auto transition-opacity duration-300",
            !image && "opacity-50 pointer-events-none"
        )}>
           <div className="flex justify-between items-center">
             <h2 className="text-lg font-semibold">Adjustments</h2>
             <Button onClick={resetFilters} variant="ghost" size="icon" disabled={!image} className="hover:bg-zinc-700">
                <RefreshCw />
                <span className="sr-only">Reset Filters</span>
            </Button>
           </div>
          
           {filterControls.map(control => (
             <div key={control.name} className="space-y-3">
               <div className="flex justify-between items-center">
                <Label htmlFor={control.name} className="font-medium text-zinc-300">{control.label}</Label>
                <span className="text-sm font-mono bg-zinc-700 px-2 py-0.5 rounded-md">{filters[control.name]}</span>
               </div>
               <Slider
                 id={control.name}
                 min={control.min}
                 max={control.max}
                 step={control.step}
                 value={[filters[control.name]]}
                 onValueChange={handleSliderChange(control.name)}
                 disabled={!image}
               />
             </div>
           ))}
        </aside>
      </div>
    </div>
  );
}
