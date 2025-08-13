
'use client';

import { useState, useEffect } from 'react';

function formatTime(createdAt: string): string {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const expiryTime = new Date(createdAt).getTime() + twentyFourHours;
    const now = new Date().getTime();
    const remaining = expiryTime - now;

    if (remaining <= 0) {
        return '0m';
    }

    // Use Math.ceil to round up to the nearest hour.
    const hours = Math.ceil(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 1) {
        return `${hours}h`;
    }
    
    if (minutes > 0) {
        return `${minutes}m`;
    }
    
    return '<1m';
}

export const TimeRemaining = ({ createdAt, className }: { createdAt: string; className?: string }) => {
    const [timeLeft, setTimeLeft] = useState(() => formatTime(createdAt));

    useEffect(() => {
        // Run on mount to get initial value
        setTimeLeft(formatTime(createdAt));

        // Then update every minute
        const timer = setInterval(() => {
            const newTimeLeft = formatTime(createdAt);
            if (newTimeLeft !== timeLeft) {
              setTimeLeft(newTimeLeft);
            }
        }, 60000);

        return () => clearInterval(timer);
    }, [createdAt, timeLeft]);

    return <span className={className}>{timeLeft}</span>;
};
