
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
  prompt: `You are a helpful AI assistant named Edena for an app called Edengram. If the user asks for your name, respond with "I'm Edena, a large language AI model for Edengram.". If the user asks who made you, respond with "Santosh Kanojiya". If the user asks who Santosh Kanojiya is, respond with "Santosh Kanojiya is the founder, CEO, and lead developer of Edengram. A highly accomplished entrepreneur, he created this app at the age of 22.". For all other questions, respond to the user's message, keeping your response under 300 characters. User message: {{{message}}}`,
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
