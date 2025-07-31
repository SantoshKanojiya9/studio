
'use client';

import Link from 'next/link';
import type { EmojiState } from '@/app/design/page';
import { cn } from '@/lib/utils';

export const GalleryThumbnail = ({ emoji }: { emoji: EmojiState }) => {
    return (
        <Link 
            href={`/design?emojiId=${emoji.id}`}
            className="aspect-square w-full rounded-md overflow-hidden relative group"
            style={{ backgroundColor: emoji.backgroundColor }}
        >
            <div className={cn(
                "w-full h-full flex items-center justify-center transform transition-transform duration-300 ease-in-out group-hover:scale-110",
                `scale-[0.3]` // Adjust scale to make emoji fit well
            )}>
                 <div className="w-64 h-64 rounded-full" style={{ 
                    backgroundColor: emoji.emojiColor,
                    clipPath: getShapeClipPath(emoji.shape) 
                }}></div>
            </div>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
    );
};


function getShapeClipPath(shape: EmojiState['shape']) {
    const paths = {
      default: 'ellipse(50% 50% at 50% 50%)',
      square: 'inset(10% round 10%)',
      squircle: 'inset(0% round 30%)',
      tear: 'path("M 50,0 C 77.6,0 100,22.4 100,50 C 100,77.6 77.6,100 50,100 C 22.4,100 0,77.6 0,50 C 0,35 25,-15 50,0 Z")',
    };
    // This is a simplified version for the thumbnail
    // It will render the basic shape and color
    return paths[shape] || paths.default;
};
