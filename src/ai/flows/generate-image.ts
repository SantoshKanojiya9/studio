// This file holds the Genkit flow for generating images based on a text prompt and/or uploaded image.

'use server';

/**
 * @fileOverview An AI image generation flow.
 *
 * - generateImage - A function that generates an image based on a prompt and/or an uploaded image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The prompt to use to generate the image.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo to use as a starting point, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async input => {
    let promptContent: any[] = [];

    if (input.photoDataUri) {
      promptContent.push({
        media: {url: input.photoDataUri},
      });
      promptContent.push({
        text: input.prompt,
      });
    } else {
      promptContent = input.prompt;
    }

    const {media} = await ai.generate({
      // Switched to Imagen for more cost-effective image generation.
      model: 'googleai/imagen-3.0-generate-001',
      prompt: promptContent,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    if (!media?.url) {
      throw new Error('No image was generated.');
    }

    return {imageUrl: media.url};
  }
);
