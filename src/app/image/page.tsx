'use client';

import { useState } from 'react';
import { ImageIcon, Upload, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image';
import NextImage from 'next/image';
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: "Prompt is required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      })
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const input: GenerateImageInput = { prompt };
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

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 />
              Image Generator
            </CardTitle>
            <CardDescription>
              Describe the image you want to create. You can also upload a reference image.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A purple cat astronaut on the moon, digital art"
                  rows={4}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-upload">Reference Image (Optional)</Label>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} className="file:text-primary-foreground" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Image'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card className="flex flex-col items-center justify-center min-h-[460px] lg:min-h-full aspect-square shadow-2xl">
          <CardContent className="p-2 w-full h-full flex items-center justify-center">
            <div className="w-full h-full aspect-square relative flex items-center justify-center rounded-lg border-dashed border-2 bg-secondary/50">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Generating your masterpiece...</p>
                </div>
              ) : generatedImage ? (
                <NextImage
                  src={generatedImage}
                  alt={prompt}
                  fill
                  className="object-contain rounded-md"
                  data-ai-hint="generated image"
                />
              ) : preview ? (
                  <NextImage src={preview} alt="Image preview" fill className="object-contain rounded-md" data-ai-hint="upload preview" />
              ) : (
                <div className="text-center text-muted-foreground flex flex-col items-center gap-4 p-4">
                  <ImageIcon size={48} />
                  <p>Your generated image will appear here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
