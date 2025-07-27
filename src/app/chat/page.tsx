
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateChatResponse, type ChatInput } from '@/ai/flows/generate-chat-response';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ChatHeader } from '@/components/chat-header';
import { AssistantMessage } from '@/components/assistant-message';

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
  const [isMuted, setIsMuted] = useState(true);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<{ messageId: string; sentenceIndex: number } | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

   useEffect(() => {
    // Start with a welcome message
    setMessages([{ role: 'assistant', name: 'Edena', content: "Welcome! I'm Edena, your AI assistant. Ask me anything.", id: 'initial' }]);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      // Cleanup speech synthesis on component unmount
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (messageId: string, text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis && !isMuted) {
      window.speechSynthesis.cancel(); // Stop any previous speech

      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let sentenceIndex = 0;

      const speakNextSentence = () => {
        if (sentenceIndex < sentences.length) {
          const utterance = new SpeechSynthesisUtterance(sentences[sentenceIndex].trim());
          utterance.onstart = () => {
            setCurrentlySpeaking({ messageId, sentenceIndex });
          };
          utterance.onend = () => {
            sentenceIndex++;
            speakNextSentence();
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setCurrentlySpeaking(null); // All sentences have been spoken
        }
      };

      speakNextSentence();
    }
  };

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

      if (!isMuted) {
        speak(assistantMessage.id, response);
      }

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
  
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (newMutedState && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setCurrentlySpeaking(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
       <div className="sticky top-0 z-10 bg-background">
        <ChatHeader>
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-muted-foreground hover:bg-transparent hover:text-primary">
            {isMuted ? <VolumeX /> : <Volume2 />}
            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>
        </ChatHeader>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    {message.role === 'assistant' ? (
                       <AssistantMessage message={message} currentlySpeaking={currentlySpeaking} />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                </div>

                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                 <div className="font-bold text-primary">Edena</div>
                <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                    <div className="flex items-center justify-center gap-2 h-5">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-[bounce_1s_infinite_0.1s]" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-[bounce_1s_infinite_0.2s]" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-[bounce_1s_infinite_0.3s]" />
                    </div>
                </div>
                </div>
            )}
            <div ref={messagesEndRef} />
            </div>
        </div>
        <div className="border-t p-4 sticky bottom-16 bg-background">
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
  );
}
