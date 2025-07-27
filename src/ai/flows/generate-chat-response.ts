
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating chat responses.
 *
 * - generateChatResponse - A function that takes a user message and returns an AI-generated response.
 * - ChatInput - The input type for the generateChatResponse function.
 * - ChatOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to respond to.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function generateChatResponse(input: ChatInput): Promise<ChatOutput> {
  return generateChatResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful AI assistant. Respond to the following user message. Keep your response under 35 words: {{{message}}}`,
});

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
