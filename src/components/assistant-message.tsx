
'use client';

import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  name?: string;
  id: string;
};

type AssistantMessageProps = {
  message: Message;
  currentlySpeaking: { messageId: string; sentenceIndex: number } | null;
};

export function AssistantMessage({ message, currentlySpeaking }: AssistantMessageProps) {
  const sentences = message.content.match(/[^.!?]+[.!?]+/g) || [message.content];

  return (
    <div className="space-y-1">
      {sentences.map((sentence, index) => {
         const isSpeaking = currentlySpeaking?.messageId === message.id && currentlySpeaking?.sentenceIndex === index;
         return (
          <div key={index} className="flex items-center gap-2">
               <div className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isSpeaking ? "bg-gradient-to-br from-blue-400 to-purple-500 scale-125 shadow-lg" : "bg-gradient-to-br from-blue-400 to-purple-500"
               )} />
               <p className="text-sm whitespace-pre-wrap">{sentence.trim()}</p>
          </div>
         )
      })}
    </div>
  )
}
