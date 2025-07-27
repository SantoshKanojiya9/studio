
'use client';

import { useState, useRef } from 'react';
import { ImageIcon, Send, Loader2, ImageUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image';
import NextImage from 'next/image';
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';

const MAX_CHARS = 300;

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
        setPrompt(text);
        setCharCount(text.length);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!prompt.trim() && !file) || charCount > MAX_CHARS) {
      toast({
        title: "Prompt or image is required",
        description: `Please enter a prompt (under ${MAX_CHARS} characters) or upload an image.`,
        variant: "destructive",
      })
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const input: GenerateImageInput = { prompt: prompt || 'Convert this image' };
      if (file) {
        input.photoDataUri = await fileToBase64(file);
      }
      const { imageUrl } = await generateImage(input);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Image generation failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
        <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Image Generation</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Enter a prompt to generate or edit an image with AI.</p>
        </header>
        
        <form onSubmit={handleSubmit} className="relative mb-6">
             <div className="relative">
                <Input
                    id="prompt"
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder={ file ? "Describe how to edit the image..." : "An impressionist oil painting of a sunflower in a purple vase..."}
                    className="pr-32 h-12 text-base"
                    disabled={isLoading}
                />
                <div className={cn("absolute right-24 top-1/2 -translate-y-1/2 text-xs", charCount > MAX_CHARS ? "text-destructive" : "text-muted-foreground")}>
                    {charCount}/{MAX_CHARS}
                </div>
            </div>
             <Input ref={fileInputRef} id="image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} className="hidden" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button type="button" size="icon" variant="ghost" onClick={triggerFileSelect} disabled={isLoading} className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <ImageUp className="h-5 w-5" />
                    <span className="sr-only">Upload Image</span>
                </Button>
                <Button type="submit" size="icon" variant="ghost" disabled={isLoading || (!prompt.trim() && !file) || charCount > MAX_CHARS } className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Generate</span>
                </Button>
            </div>
        </form>

        <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg border-2 border-dashed border-border/50 overflow-hidden">
            <div className="relative w-full h-full">
            {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-background/50">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Generating your masterpiece...</p>
                </div>
              ) : generatedImage ? (
                <NextImage
                  src={generatedImage}
                  alt={prompt}
                  fill
                  className="object-contain"
                  data-ai-hint="generated image"
                />
              ) : preview ? (
                  <NextImage src={preview} alt="Image preview" fill className="object-contain" data-ai-hint="upload preview" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 text-center text-muted-foreground">
                  <ImageIcon size={48} />
                  <p>Your generated image will appear here.</p>
                </div>
              )}
            </div>
        </div>
    </div>
  );
}
