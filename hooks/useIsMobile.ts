"use client";

import { useSyncExternalStore } from "react";

/**
 * Custom hook to detect if the current viewport is mobile-sized
 * Breakpoint: < 768px
 * 
 * @returns {boolean} true if viewport width is less than 768px
 */
export function useIsMobile(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const query = "(max-width: 767px)";

function getSnapshot(): boolean {
    return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
    return false;
}

function subscribe(callback: () => void): () => void {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
}
