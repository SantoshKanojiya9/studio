'use client';

import { useState } from 'react';
import { Loader2, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateTts, type GenerateTtsInput } from '@/ai/flows/generate-tts';
import { useToast } from '@/hooks/use-toast';

export default function VoiceGeneratorPage() {
  const [text, setText] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({
        title: 'Text is required',
        description: 'Please enter some text to generate audio.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedAudio(null);

    try {
      const input: GenerateTtsInput = { text };
      const { audioUrl } = await generateTts(input);
      setGeneratedAudio(audioUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: 'Audio generation failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic />
            Text-to-Speech
          </CardTitle>
          <CardDescription>
            Enter some text and I'll read it aloud for you.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., Hello, world! I am an AI assistant."
                rows={6}
                disabled={isLoading}
                required
              />
            </div>
            {generatedAudio && (
              <div className="space-y-2">
                 <Label>Generated Audio</Label>
                <audio controls src={generatedAudio} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
             {isLoading && !generatedAudio && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Generating audio...</p>
                </div>
              )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                <Volume2 className="mr-2 h-4 w-4" />
                Generate Audio
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
