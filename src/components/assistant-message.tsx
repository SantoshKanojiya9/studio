
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
          <div key={index} className="flex items-start gap-3">
               <div className="w-2 h-2 rounded-full mt-1.5 shrink-0">
                {isSpeaking && (
                    <div className="w-full h-full rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                )}
               </div>
               <p className="text-sm whitespace-pre-wrap flex-1">{sentence.trim()}</p>
          </div>
         )
      })}
    </div>
  )
}
