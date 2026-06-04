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
        setTotalPages,
        setEpubRendition,
        zoomLevel,
        uiLanguage,
    } = useStore();

    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);
    const [location, setLocation] = useState<EpubLocation>(currentLocation || 0);
    const [isReaderReady, setIsReaderReady] = useState(false);
    const renditionRef = useRef<EpubRendition | null>(null);
    const isLargeBookRef = useRef(false);

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
    const [epubData, setEpubData] = useState<ArrayBuffer | string | null>(null);

    useEffect(() => {
        if (!currentFile) { setEpubData(null); return; }
        if (currentFile instanceof File) {
            // Track file size for large book detection
            if (currentFile.size > LARGE_BOOK_SIZE_BYTES) {
                isLargeBookRef.current = true;
            }
            const reader = new FileReader();
            reader.onload = (e) => setEpubData(e.target?.result as ArrayBuffer ?? null);
            reader.onerror = () => setEpubData(null);
            reader.readAsArrayBuffer(currentFile);
        } else {
            setEpubData(currentFile as string);
        }
        return () => { setIsReaderReady(false); };
    }, [currentFile]);

    // Dynamic zoom: update EPUB font size when zoomLevel changes
    useEffect(() => {
        if (renditionRef.current && isReaderReady) {
            try {
                renditionRef.current.themes.fontSize(`${zoomLevel}%`);
            } catch { /* silent — some renditions don't support fontSize */ }
        }
    }, [zoomLevel, isReaderReady]);

    const onLocationChanged = useCallback((loc: EpubLocation) => {
        setLocation(loc);
        if (typeof loc === "string") {
            setCurrentLocation(loc);
            try {
                if (!isLargeBookRef.current && (renditionRef.current?.locations?.length() ?? 0) > 0) {
                    const current = renditionRef.current?.currentLocation();
                    if (current?.start) {
                        const page = renditionRef.current?.locations?.locationFromCfi(current.start.cfi) ?? 0;
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
        rendition.hooks.content.register((contents: { document: Document }) => {
            const doc = contents.document;
            if (!doc) return;
            const style = doc.createElement('style');
            style.textContent = `
                body {
                    font-family: 'Lora', Georgia, serif !important;
                    line-height: 1.8 !important;
                    padding: 0 8px !important;
                    overflow: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                    touch-action: pan-x pan-y pinch-zoom !important;
                }
                p { line-height: 1.8 !important; margin-bottom: 1em !important; }
                * { max-width: 100% !important; box-sizing: border-box !important; }
                img { height: auto !important; }
            `;
            doc.head.appendChild(style);
        });

        if (currentLocation) {
            try { rendition.display(currentLocation); } catch { /* silent */ }
        }

        // Determine if this is a large book by spine count
        const book = rendition.book;
        if (book?.spine?.items?.length > LARGE_BOOK_SPINE_THRESHOLD) {
            isLargeBookRef.current = true;
        }

        // Generate locations only for small/medium books
        if (book?.ready && !isLargeBookRef.current) {
            book.ready.then(() => {
                try { return rendition.locations.generate(1600); } catch { return []; }
            }).then((locations: { length: number } | Array<unknown> | undefined) => {
                if (locations) setTotalPages((locations as { length: number }).length);
            }).catch(() => { /* location generation optional */ });
        } else if (book?.ready && isLargeBookRef.current) {
            // For large books, use spine item count as total "chapters"
            book.ready.then(() => {
                const spineCount = book.spine?.items?.length ?? 0;
                if (spineCount > 0) setTotalPages(spineCount);
            }).catch(() => {});
        }

        // Text selection for translation — only on mouseup/touchend to avoid spam
        rendition.on("selected", (_cfiRange: string, contents: EpubContents) => {
            try {
                const selection = contents.window.getSelection();
                if (!selection) return;
                const text = selection.toString().trim();
                if (text) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const iframe = (contents.window.frameElement as Element) || document.querySelector(".epub-viewer-container iframe");
                    if (iframe) {
                        const iframeRect = iframe.getBoundingClientRect();
                        setSelectedText(text);
                        setSelectionPosition({
                            x: iframeRect.left + rect.left + rect.width / 2,
                            y: iframeRect.top + rect.top,
                        });
                    }
                }
            } catch (e) { console.error(e); }
        });
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
            />
        </div>
    );
}
