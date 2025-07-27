
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, Smile, Frown, Surprised, Meh } from 'lucide-react';

type Expression = 'happy' | 'sad' | 'surprised' | 'neutral';

const emojis: Record<Expression, string> = {
  happy: '😊',
  sad: '😢',
  surprised: '😮',
  neutral: '😐',
};

export default function FaceMojiPage() {
  const [expression, setExpression] = useState<Expression>('neutral');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 bg-secondary/30">
        <Card className="w-full max-w-4xl shadow-2xl bg-background/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-center text-3xl font-logo">FaceMoji</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="w-full md:w-1/2 relative aspect-video bg-secondary rounded-lg overflow-hidden border">
                   <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                   {hasCameraPermission === false && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4">
                           <Alert variant="destructive">
                                <Video className="h-4 w-4" />
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature. You may need to refresh the page.
                                </AlertDescription>
                           </Alert>
                       </div>
                   )}
                </div>
                <div className="flex flex-col items-center gap-6">
                    <div className="text-8xl md:text-9xl transition-transform duration-300 ease-in-out transform hover:scale-110">
                        {emojis[expression]}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <Button onClick={() => setExpression('happy')} variant={expression === 'happy' ? 'default' : 'outline'} size="lg">
                            <Smile className="mr-2"/> Happy
                         </Button>
                         <Button onClick={() => setExpression('sad')} variant={expression === 'sad' ? 'default' : 'outline'} size="lg">
                             <Frown className="mr-2"/> Sad
                         </Button>
                         <Button onClick={() => setExpression('surprised')} variant={expression === 'surprised' ? 'default' : 'outline'} size="lg">
                            <Surprised className="mr-2"/> Surprised
                         </Button>
                         <Button onClick={() => setExpression('neutral')} variant={expression === 'neutral' ? 'default' : 'outline'} size="lg">
                            <Meh className="mr-2"/> Neutral
                         </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
