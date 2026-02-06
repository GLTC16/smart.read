'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current viewport is mobile-sized
 * Breakpoint: < 768px
 * 
 * @returns {boolean} true if viewport width is less than 768px
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if window is defined (client-side)
        if (typeof window === 'undefined') return;

        // Create media query matcher
        const mediaQuery = window.matchMedia('(max-width: 767px)');

        // Set initial value
        setIsMobile(mediaQuery.matches);

        // Handler for viewport changes
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(e.matches);
        };

        // Listen for changes
        // Use addEventListener for modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange as any);
        }

        // Cleanup
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                mediaQuery.removeListener(handleChange as any);
            }
        };
    }, []);

    return isMobile;
}
