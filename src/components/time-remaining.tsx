
'use client';

import { useState, useEffect } from 'react';

function formatElapsedTime(createdAt: string): string {
    const now = new Date().getTime();
    const startTime = new Date(createdAt).getTime();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);

    if (elapsedSeconds < 60) {
        return `${elapsedSeconds}s`;
    }

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) {
        return `${elapsedMinutes}m`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    return `${elapsedHours}h`;
}

export const TimeRemaining = ({ createdAt, className }: { createdAt: string; className?: string }) => {
    const [timeLeft, setTimeLeft] = useState(() => formatElapsedTime(createdAt));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(formatElapsedTime(createdAt));
        }, 1000); // Update every second

        return () => clearInterval(timer);
    }, [createdAt]);

    return <span className={className}>{timeLeft}</span>;
};
