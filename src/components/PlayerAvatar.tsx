'use client';

import { useState } from 'react';

export default function PlayerAvatar({ src, alt, fallbackName }: { src: string | null, alt: string, fallbackName: string }) {
    const [imgSrc, setImgSrc] = useState(src || `https://ui-avatars.com/api/?name=${fallbackName}&background=random`);

    return (
        <img
            src={imgSrc}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => {
                setImgSrc(`https://ui-avatars.com/api/?name=${fallbackName}&background=random`);
            }}
        />
    );
}
