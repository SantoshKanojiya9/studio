
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Bot } from 'lucide-react';
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
  name?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', name: 'Edena', content: "Welcome! I'm Edena, your AI assistant. Ask me anything." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      const assistantMessage: Message = { role: 'assistant', name: 'Edena', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error)
    {
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


  return (
    <div className="flex flex-col h-full">
       <ChatHeader />
       <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2">
                    <MessageSquare size={18} />
                    <span className="font-semibold text-sm">AI Assistant</span>
                </div>
            </div>
            <ScrollArea className="flex-1" viewportRef={scrollAreaViewportRef}>
                <div className="space-y-6 pr-4">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        'flex flex-col gap-2',
                        message.role === 'user' ? 'items-end' : 'items-start'
                    )}
                    >
                    
                    {message.role === 'assistant' && (
                        <div className="font-bold text-primary">{message.name}</div>
                    )}
                     <div
                        className={cn(
                        'rounded-lg px-4 py-2 max-w-[80%]',
                         message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        )}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                     <div className="font-bold text-primary">Edena</div>
                    <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                        <div className="flex items-center justify-center gap-2 h-5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="border-t-0 pt-2">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
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
