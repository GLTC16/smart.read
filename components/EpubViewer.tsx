"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ReactReader } from "react-reader";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";
import translations from "@/lib/translations";

type EpubLocation = string | number;
type EpubRendition = {
    themes: {
        default: (theme: Record<string, Record<string, string>>) => void;
        fontSize: (size: string) => void;
    };
    display: (location: EpubLocation) => void;
    ready: Promise<void>;
    locations: {
        length: () => number;
        locationFromCfi: (cfi: string) => number;
        generate: (chars: number) => Promise<{ length: number } | Array<unknown>>;
    };
    currentLocation: () => { start?: { cfi: string } } | null;
    on: (event: "selected", callback: (cfiRange: string, contents: EpubContents) => void) => void;
    book: {
        ready: Promise<void>;
        spine: { items: unknown[] };
    };
    hooks: {
        content: {
            register: (fn: (contents: { document: Document }) => void) => void;
        };
    };
};
type EpubContents = {
    window: Window;
};

// Threshold to skip location generation (avoids freezing on large books)
const LARGE_BOOK_SPINE_THRESHOLD = 60;
const LARGE_BOOK_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export default function EpubViewer() {
    const {
        currentFile,
        currentLocation,
        setCurrentLocation,
        setToc,
        setSelectedText,
        setSelectionPosition,
        setCurrentPage,
        currentPage,
        totalPages,
        setTotalPages,
        setEpubRendition,
        zoomLevel,
        uiLanguage,
    } = useStore();

    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);
    const [location, setLocation] = useState<EpubLocation>(currentLocation || 0);
    const [isReaderReady, setIsReaderReady] = useState(false);
    const renditionRef = useRef<EpubRendition | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isLargeBookRef = useRef(false);
    const lastPageRef = useRef(currentPage);

    // scrolled-continuous is most compatible across epub types.
    const epubOptions = useMemo(() => ({
        flow: "scrolled-continuous",
        manager: "continuous",
        width: "100%",
        height: "100%",
    }), []);

    // epubjs determineType() checks file extension on the URL.
    // Blob URLs have no extension → falls to DIRECTORY branch → fails.
    // Fix: read File as ArrayBuffer so epubjs treats it as INPUT_TYPE.BINARY.
    const [epubData, setEpubData] = useState<string | null>(null);

    useEffect(() => {
        if (!currentFile) {
            setEpubData(null);
            return;
        }

        let url: string;
        let isObjectUrl = false;

        if (currentFile instanceof File) {
            // Track file size for large book detection
            if (currentFile.size > LARGE_BOOK_SIZE_BYTES) {
                isLargeBookRef.current = true;
            }
            // Use ObjectURL but append a hash to trick epub.js determineType()
            url = URL.createObjectURL(currentFile) + '#file.epub';
            isObjectUrl = true;
        } else {
            url = currentFile as string;
            // Force cache reset for cloud URLs if it doesn't already have query params
            if (url.startsWith('http') && !url.includes('?')) {
                url += `?t=${Date.now()}`;
            }
        }
        
        setEpubData(url);

        return () => {
            setIsReaderReady(false);
            setEpubRendition(null as any);
            if (isObjectUrl) {
                URL.revokeObjectURL(url.split('#')[0]);
            }
        };
    }, [currentFile, setEpubRendition]);

    // Dynamic zoom: update EPUB font size when zoomLevel changes
    useEffect(() => {
        if (renditionRef.current && isReaderReady) {
            try {
                renditionRef.current.themes.fontSize(`${zoomLevel}%`);
            } catch { /* silent — some renditions don't support fontSize */ }
        }
    }, [zoomLevel, isReaderReady]);

    // Navigate to page when user moves the slider
    useEffect(() => {
        if (isReaderReady && renditionRef.current && currentPage !== lastPageRef.current) {
            lastPageRef.current = currentPage;
            try {
                const locations = renditionRef.current.locations;
                if (locations && typeof locations.length === 'function' && locations.length() > 0) {
                    const cfi = (locations as any).cfiFromLocation(currentPage - 1);
                    if (cfi) {
                        renditionRef.current.display(cfi);
                    }
                }
            } catch (e) {
                console.error("Failed to navigate to page:", e);
            }
        }
    }, [currentPage, isReaderReady]);

    const onLocationChanged = useCallback((loc: EpubLocation) => {
        setLocation(loc);
        if (typeof loc === "string") {
            setCurrentLocation(loc);
            try {
                if (!isLargeBookRef.current && (renditionRef.current?.locations?.length() ?? 0) > 0) {
                    const current = renditionRef.current?.currentLocation();
                    if (current?.start) {
                        const page = renditionRef.current?.locations?.locationFromCfi(current.start.cfi) ?? 0;
                        lastPageRef.current = page + 1; // Prevent feedback loop
                        setCurrentPage(page + 1);
                    }
                }
            } catch { /* silent */ }
        }
    }, [setCurrentLocation, setCurrentPage]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRendition = useCallback((rendition: any) => {
        renditionRef.current = rendition as EpubRendition;
        setEpubRendition(rendition as unknown as import('@/store/useStore').Rendition);
        setIsReaderReady(true);

        // Set initial font size based on current zoom
        try {
            rendition.themes.fontSize(`${zoomLevel}%`);
        } catch { /* silent */ }

        // Improve typography and ensure smooth scrolling inside EPUB iframe
        rendition.hooks.content.register((contents: { document: Document; window: Window }) => {
            const doc = contents.document;
            const win = contents.window;
            if (!doc || !win) return;
            const style = doc.createElement('style');
            style.textContent = `
                body {
                    font-family: 'Lora', Georgia, serif !important;
                    line-height: 1.8 !important;
                    padding: 0 8px !important;
                    overflow: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                    touch-action: pan-x pan-y pinch-zoom !important;
                    -webkit-user-select: text !important;
                    user-select: text !important;
                    -webkit-touch-callout: default !important;
                }
                p { line-height: 1.8 !important; margin-bottom: 1em !important; }
                * { max-width: 100% !important; box-sizing: border-box !important; }
                img { height: auto !important; }
            `;
            doc.head.appendChild(style);

            // 1. Bulletproof manual selection handler with proper debouncing
            let selectionTimeout: NodeJS.Timeout;
            const handleSelection = () => {
                clearTimeout(selectionTimeout);
                selectionTimeout = setTimeout(() => {
                    try {
                        const selection = win.getSelection();
                        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                            useStore.getState().resetSelection();
                            return;
                        }
                        
                        const text = selection.toString().trim();
                        if (!text) return;
                        
                        const range = selection.getRangeAt(0);
                        const rect = range.getBoundingClientRect();
                        
                        // --- SAFE IFRAME DISCOVERY ---
                        let iframe: HTMLIFrameElement | null = null;
                        
                        try {
                            // Try direct access (throws SecurityError on some cross-origin/blob setups)
                            iframe = win.frameElement as HTMLIFrameElement;
                        } catch (err) {
                            // Suppress SecurityError
                        }

                        // Fallback: search DOM for matching contentWindow
                        if (!iframe && containerRef.current) {
                            const iframes = Array.from(containerRef.current.querySelectorAll('iframe'));
                            for (const f of iframes) {
                                try {
                                    if (f.contentWindow === win) {
                                        iframe = f;
                                        break;
                                    }
                                } catch (e) {
                                    // Ignore access errors on other iframes
                                }
                            }
                            // Last resort: if only 1 iframe exists, use it
                            if (!iframe && iframes.length === 1) {
                                iframe = iframes[0];
                            }
                        }
                        
                        if (!iframe) return;
                        
                        const iframeRect = iframe.getBoundingClientRect();

                        setSelectedText(text);
                        setSelectionPosition({
                            x: iframeRect.left + rect.left + rect.width / 2,
                            y: iframeRect.top + rect.top,
                        });
                    } catch (e) { 
                        console.error("Manual epub selection error:", e); 
                    }
                }, 100); // Fast 100ms debounce captures fleeting mobile selections
            };

            // 2. Bind listeners directly to iframe document
            doc.addEventListener('selectionchange', handleSelection, false);
            doc.addEventListener('touchend', handleSelection, false);
            doc.addEventListener('mouseup', handleSelection, false);
        });

        // 3. Bulletproof fallback: use epub.js native 'selected' event
        rendition.on('selected', (cfiRange: string, contents: any) => {
            try {
                const win = contents.window;
                const selection = win.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                
                const text = selection.toString().trim();
                if (!text) return;
                
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                let iframe: HTMLIFrameElement | null = null;
                try { iframe = win.frameElement as HTMLIFrameElement; } catch (e) {}
                
                if (!iframe && containerRef.current) {
                    const iframes = Array.from(containerRef.current.querySelectorAll('iframe'));
                    for (const f of iframes) {
                        try { if (f.contentWindow === win) { iframe = f; break; } } catch (e) {}
                    }
                    if (!iframe && iframes.length === 1) iframe = iframes[0];
                }
                
                const iframeRect = iframe ? iframe.getBoundingClientRect() : { left: 0, top: 0 };
                
                setSelectedText(text);
                setSelectionPosition({
                    x: iframeRect.left + rect.left + rect.width / 2,
                    y: iframeRect.top + rect.top,
                });
            } catch (e) {
                console.error("Native epub selection error:", e);
            }
        });

        if (currentLocation) {
            try { rendition.display(currentLocation); } catch { /* silent */ }
        }

        // Determine if this is a large book by spine count
        const book = rendition.book;
        if (book?.spine?.items?.length > LARGE_BOOK_SPINE_THRESHOLD) {
            isLargeBookRef.current = true;
        }

        // Always generate locations so the slider can work universally
        if (book?.ready) {
            book.ready.then(() => {
                try { return rendition.locations.generate(1600); } catch { return []; }
            }).then((locations: { length: number } | Array<unknown> | undefined) => {
                if (locations) setTotalPages((locations as { length: number }).length);
            }).catch(() => { /* location generation optional */ });
        }

        // Generación de localizaciones omitida por brevedad
    }, [currentLocation, setTotalPages, setSelectedText, setSelectionPosition, setEpubRendition, zoomLevel]);

    if (!epubData) {
        return (
            <div
                className="flex flex-col items-center justify-center h-full gap-4"
                style={{ background: 'var(--bg-surface)', minHeight: '400px' }}
            >
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}>
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--teal)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.readingFile}</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full epub-viewer-container"
            style={{ minHeight: '500px', background: 'var(--bg-surface)' }}
        >
            {!isReaderReady && (
                <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
                    style={{ background: 'var(--bg-surface)' }}
                >
                    <div
                        className="p-4 rounded-2xl"
                        style={{
                            background: 'rgba(20,184,166,0.1)',
                            border: '1px solid rgba(20,184,166,0.2)',
                        }}
                    >
                        <Loader2
                            className="w-8 h-8 animate-spin"
                            style={{ color: 'var(--teal)' }}
                        />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {t.loadingEpub}
                    </p>
                </div>
            )}

            <ReactReader
                url={epubData}
                location={location}
                locationChanged={onLocationChanged}
                getRendition={handleRendition}
                tocChanged={setToc}
                epubOptions={epubOptions}
                readerStyles={{
                    container: { overflow: 'hidden', height: '100%', position: 'relative' },
                    readerArea: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }
                }}
            />
            {/* CSS to hide the built-in React Reader footer since the prop crashes it */}
            <style jsx global>{`
                .react-reader-footer, button[title="Close table of content"], button[title="Table of content"] {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
