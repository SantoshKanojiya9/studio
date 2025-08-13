
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

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 24) {
        return '24h';
    }

    if (hours > 0) {
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
            setTimeLeft(formatTime(createdAt));
        }, 60000);

        return () => clearInterval(timer);
    }, [createdAt]);

    return <span className={className}>{timeLeft}</span>;
};
