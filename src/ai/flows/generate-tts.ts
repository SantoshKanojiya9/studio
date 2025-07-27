'use server';

/**
 * @fileOverview A text-to-speech AI flow.
 *
 * - generateTts - A function that converts text to speech.
 * - GenerateTtsInput - The input type for the generateTts function.
 * - GenerateTtsOutput - The return type for the generateTts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const GenerateTtsInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type GenerateTtsInput = z.infer<typeof GenerateTtsInputSchema>;

const GenerateTtsOutputSchema = z.object({
  audioUrl: z.string().describe('The generated audio as a data URI.'),
});
export type GenerateTtsOutput = z.infer<typeof GenerateTtsOutputSchema>;

export async function generateTts(
  input: GenerateTtsInput
): Promise<GenerateTtsOutput> {
  return generateTtsFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateTtsFlow = ai.defineFlow(
  {
    name: 'generateTtsFlow',
    inputSchema: GenerateTtsInputSchema,
    outputSchema: GenerateTtsOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: input.text,
    });

    if (!media?.url) {
      throw new Error('No audio was generated.');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return { audioUrl: `data:audio/wav;base64,${wavBase64}` };
  }
);
