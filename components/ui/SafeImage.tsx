"use client";

import React, { useState } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackUrl?: string;
}

/**
 * A client-side image component that safely handles 404/403 errors
 * by hiding itself or showing a fallback, preventing build errors 
 * in Next.js Server Components.
 */
export default function SafeImage({ src, alt, className, ...props }: SafeImageProps) {
    const [error, setError] = useState(false);

    if (error || !src) return null;

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    );
}
