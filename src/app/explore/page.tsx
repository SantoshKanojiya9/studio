
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Image from 'next/image';

const MasonryGrid = () => {
  const images = [
    { src: 'https://placehold.co/400x600.png', alt: 'Placeholder 1', hint: 'anime girl' },
    { src: 'https://placehold.co/400x400.png', alt: 'Placeholder 2', hint: 'fitness woman' },
    { src: 'https://placehold.co/400x500.png', alt: 'Placeholder 3', hint: 'action scene' },
    { src: 'https://placehold.co/400x400.png', alt: 'Placeholder 4', hint: 'anime character' },
    { src: 'https://placehold.co/400x600.png', alt: 'Placeholder 5', hint: 'movie scene' },
    { src: 'https://placehold.co/400x500.png', alt: 'Placeholder 6', hint: 'kids playing' },
    { src: 'https://placehold.co/400x500.png', alt: 'Placeholder 7', hint: 'friends' },
    { src: 'https://placehold.co/400x600.png', alt: 'Placeholder 8', hint: 'anime drawing' },
    { src: 'https://placehold.co/400x400.png', alt: 'Placeholder 9', hint: 'anime woman' },
    { src: 'https://placehold.co/400x600.png', alt: 'Placeholder 10', hint: 'anime girl laying' },
    { src: 'https://placehold.co/400x400.png', alt: 'Placeholder 11', hint: 'woman swimming' },
    { src: 'https://placehold.co/400x500.png', alt: 'Placeholder 12', hint: 'anime character red' },
    { src: 'https://placehold.co/400x400.png', alt: 'Placeholder 13', hint: 'man portrait' },
    { src: 'https://placehold.co/400x600.png', alt: 'Placeholder 14', hint: 'couple talking' },
  ];

  return (
    <div className="p-1">
      <div className="grid grid-cols-3 gap-1">
        {images.map((image, index) => (
          <div key={index} className="overflow-hidden rounded-sm">
            <Image
              src={image.src}
              alt={image.alt}
              data-ai-hint={image.hint}
              width={400}
              height={500}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};


export default function ExplorePage() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search with Meta AI"
            className="pl-10 h-12 rounded-lg bg-muted border-none focus-visible:ring-primary"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <MasonryGrid />
      </div>
    </div>
  );
}
