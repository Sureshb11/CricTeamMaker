'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function CountdownWidget({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [hasMounted, setHasMounted] = useState(false);

    function calculateTimeLeft() {
        // Ensure consistent date parsing
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: any = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        setHasMounted(true);
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!hasMounted) return null; // Avoid hydration mismatch

    if (Object.keys(timeLeft).length === 0) {
        return (
            <div style={containerStyle}>
                <div style={{ fontWeight: 'bold', color: '#ff4444' }}>Match Started or Finished!</div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                <Timer size={14} /> Next Match In
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <TimeBox value={timeLeft.days} label="Days" />
                <TimeBox value={timeLeft.hours} label="Hrs" />
                <TimeBox value={timeLeft.minutes} label="Mins" />
                <TimeBox value={timeLeft.seconds} label="Secs" />
            </div>
        </div>
    );
}

const TimeBox = ({ value, label }: { value: number, label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', lineHeight: '1' }}>
            {value < 10 ? `0${value}` : value}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>{label}</div>
    </div>
);

const containerStyle = {
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '15px 25px',
    marginTop: '20px',
    display: 'inline-block'
};
