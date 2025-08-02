
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Camera } from 'lucide-react';

export default function ReelsPage() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-black text-white">
            <div className="text-center space-y-4">
                <Camera className="h-16 w-16 mx-auto text-neutral-400" />
                <h1 className="text-2xl font-bold">Reels Page</h1>
                <p className="text-neutral-300">This page is under construction.</p>
                <Button asChild variant="secondary">
                    <Link href="/mood">Go Back Home</Link>
                </Button>
            </div>
        </div>
    );
}
