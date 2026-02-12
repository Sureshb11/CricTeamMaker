'use client';

import { usePathname } from 'next/navigation';

export default function BackgroundImages() {
    const pathname = usePathname();
    const isRegisterPage = pathname === '/register';
    const opacity = isRegisterPage ? 1 : 0.5;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: -1,
            overflow: 'hidden'
        }}>
            {/* Left Image - Virat1.jpg */}
            <img
                src="/virat1.jpg?v=1"
                alt="Background Left"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    width: '35%',
                    transform: 'translateY(-50%) scale(1.0)',
                    opacity: opacity,
                    transition: 'opacity 0.5s ease',
                    maskImage: 'radial-gradient(ellipse at left center, black 40%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at left center, black 40%, transparent 80%)',
                    objectFit: 'cover',
                    height: '100vh',
                    mixBlendMode: 'overlay'
                }}
            />


            {/* Right Image - Virat.jpg */}
            <img
                src="/virat.jpg?v=3"
                alt="Background Right"
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    width: '35%',
                    transform: 'translateY(-50%)',
                    opacity: opacity,
                    transition: 'opacity 0.5s ease',
                    maskImage: 'linear-gradient(to left, black, transparent)',
                    WebkitMaskImage: 'linear-gradient(to left, black, transparent)',
                    objectFit: 'cover',
                    height: '100vh'
                }}
            />
        </div>
    );
}
