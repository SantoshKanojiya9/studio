
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateChatResponse, type ChatInput } from '@/ai/flows/generate-chat-response';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ChatHeader } from '@/components/chat-header';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
        setTimeout(() => {
            scrollAreaViewportRef.current!.scrollTo({
                top: scrollAreaViewportRef.current!.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
  }, [messages]);

  const handleAudio = (text: string) => {
    if (isMuted || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = { message: currentInput };
      const { response } = await generateChatResponse(chatInput);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      handleAudio(response);
    } catch (error) {
      console.error('Error generating chat response:', error);
      toast({
        title: "An error occurred",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((msg) => msg !== userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const isCurrentlyMuted = !prev;
      if (isCurrentlyMuted && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return isCurrentlyMuted;
    });
  };

  return (
    <div className="flex flex-col h-full">
       <ChatHeader isMuted={isMuted} onToggleMute={toggleMute} />
       <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1" viewportRef={scrollAreaViewportRef}>
                <div className="space-y-6 p-4 container">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot size={18}/>
                        </AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        'rounded-lg px-4 py-2 max-w-[80%] shadow-md',
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        )}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="h-8 w-8 border">
                        <AvatarFallback>
                            <User size={18}/>
                        </AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={18}/>
                        </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground shadow-md">
                        <div className="flex items-center justify-center gap-2 h-5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="border-t">
                <form onSubmit={handleSubmit} className="container flex items-center gap-2 py-4">
                    <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                    aria-label="Chat input"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send message">
                    <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
      </div>
    </div>
  );
}
