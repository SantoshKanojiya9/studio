
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
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
  id: string;
};

const MAX_WORDS = 35;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

   useEffect(() => {
    // Start with a welcome message
    setMessages([{ role: 'assistant', name: 'Edena', content: "Welcome! I'm Edena, your AI assistant. Ask me anything.", id: 'initial' }]);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || wordCount > MAX_WORDS) return;

    const userMessage: Message = { role: 'user', content: input, id: Date.now().toString() };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setWordCount(0);
    setIsLoading(true);

    try {
      const chatInput: ChatInput = { message: currentInput };
      const { response } = await generateChatResponse(chatInput);
      const assistantMessage: Message = { role: 'assistant', name: 'Edena', content: response, id: (Date.now() + 1).toString() };
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= MAX_WORDS) {
      setInput(text);
      setWordCount(words.length);
    }
  };


  return (
    <div className="flex flex-col h-full">
       <ChatHeader />
       <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
            <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
                <div className="space-y-6 pr-4">
                {messages.map((message) => (
                    <div
                    key={message.id}
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
                        'rounded-lg px-4 py-2 flex items-center gap-2 max-w-full',
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
                <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
            <div className="border-t-0 pt-2">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                        className="flex-1 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary pr-16"
                        aria-label="Chat input"
                        />
                         <div className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-xs", wordCount > MAX_WORDS ? "text-destructive" : "text-muted-foreground")}>
                            {wordCount}/{MAX_WORDS}
                        </div>
                    </div>
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim() || wordCount > MAX_WORDS} aria-label="Send message">
                    <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
      </div>
    </div>
  );
}
