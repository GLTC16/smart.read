"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ReactReader } from "react-reader";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";
import translations from "@/lib/translations";
import ReaderTopBar from "./ReaderTopBar";

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
    prev: () => void;
    next: () => void;
    book: {
        ready: Promise<void>;
        spine: { items: unknown[] };
    };
    hooks: {
        content: {
            register: (fn: (contents: { document: Document; window: Window }) => void) => void;
        };
    };
};
type EpubContents = {
    window: Window;
};

const LARGE_BOOK_SPINE_THRESHOLD = 60;
const LARGE_BOOK_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Expand caret range to the word boundary around the cursor */
function expandToWord(range: Range, doc: Document): string {
    try {
        // Standard API
        (range as Range & { expand: (unit: string) => void }).expand('word');
        return range.toString().trim();
    } catch {
        // Manual fallback
        const node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE) return '';
        const text = node.textContent || '';
        let s = range.startOffset;
        let e = range.startOffset;
        while (s > 0 && /[\p{L}\p{N}''-]/u.test(text[s - 1])) s--;
        while (e < text.length && /[\p{L}\p{N}''-]/u.test(text[e])) e++;
        range.setStart(node, s);
        range.setEnd(node, e);
        return text.slice(s, e).trim();
    }
}

/** Find the iframe element whose contentWindow === win */
function findIframe(
    win: Window,
    containerEl: HTMLDivElement | null,
): HTMLIFrameElement | null {
    let iframe: HTMLIFrameElement | null = null;
    try { iframe = win.frameElement as HTMLIFrameElement; } catch { /* cross-origin guard */ }
    if (!iframe && containerEl) {
        const iframes = Array.from(containerEl.querySelectorAll('iframe'));
        for (const f of iframes) {
            try { if (f.contentWindow === win) { iframe = f; break; } } catch { /* skip */ }
        }
        if (!iframe && iframes.length === 1) iframe = iframes[0];
    }
    return iframe;
}

// ─── Component ───────────────────────────────────────────────────────────────

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

    const epubOptions = useMemo(() => ({
        flow: "scrolled-continuous",
        manager: "continuous",
        width: "100%",
        height: "100%",
    }), []);

    // ── Build epubData ────────────────────────────────────────────────────────
    // ROOT FIX: blob URLs have no .epub extension in their path component
    // so epubjs determineType() returns DIRECTORY → fails.
    // Fix A (local File): read as ArrayBuffer → typeof !== "string" → BINARY → openEpub() ✓
    // Fix B (cloud URL):  URL ends with .epub → determineType returns EPUB → fetch → openEpub() ✓
    const [epubData, setEpubData] = useState<ArrayBuffer | string | null>(null);

    useEffect(() => {
        if (!currentFile) { setEpubData(null); return; }

        let cancelled = false;

        if (currentFile instanceof File) {
            if (currentFile.size > LARGE_BOOK_SIZE_BYTES) isLargeBookRef.current = true;

            const reader = new FileReader();
            reader.onload = (e) => {
                if (!cancelled) setEpubData((e.target?.result as ArrayBuffer) ?? null);
            };
            reader.onerror = () => {
                if (!cancelled) setEpubData(null);
            };
            reader.readAsArrayBuffer(currentFile);
        } else {
            // Cloud / remote URL — must end in .epub for determineType to work
            let url = currentFile as string;
            if (url.startsWith('http') && !url.includes('?')) url += `?t=${Date.now()}`;
            setEpubData(url);
        }

        return () => {
            cancelled = true;
            setIsReaderReady(false);
            setEpubRendition(null as any);
        };
    }, [currentFile, setEpubRendition]);

    // ── Sync zoom level ───────────────────────────────────────────────────────
    useEffect(() => {
        if (renditionRef.current && isReaderReady) {
            try { renditionRef.current.themes.fontSize(`${zoomLevel}%`); } catch { /* silent */ }
        }
    }, [zoomLevel, isReaderReady]);

    // ── Page slider → navigate ────────────────────────────────────────────────
    useEffect(() => {
        if (isReaderReady && renditionRef.current && currentPage !== lastPageRef.current) {
            lastPageRef.current = currentPage;
            try {
                const locations = renditionRef.current.locations;
                if (locations && typeof locations.length === 'function' && locations.length() > 0) {
                    const cfi = (locations as any).cfiFromLocation(currentPage - 1);
                    if (cfi) renditionRef.current.display(cfi);
                }
            } catch (e) {
                console.error("Failed to navigate to page:", e);
            }
        }
    }, [currentPage, isReaderReady]);

    // ── Location changed ──────────────────────────────────────────────────────
    const onLocationChanged = useCallback((loc: EpubLocation) => {
        setLocation(loc);
        if (typeof loc === "string") {
            setCurrentLocation(loc);
            try {
                if (!isLargeBookRef.current && (renditionRef.current?.locations?.length() ?? 0) > 0) {
                    const current = renditionRef.current?.currentLocation();
                    if (current?.start) {
                        const page = renditionRef.current?.locations?.locationFromCfi(current.start.cfi) ?? 0;
                        lastPageRef.current = page + 1;
                        setCurrentPage(page + 1);
                    }
                }
            } catch { /* silent */ }
        }
    }, [setCurrentLocation, setCurrentPage]);

    // ── Rendition setup ───────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRendition = useCallback((rendition: any) => {
        renditionRef.current = rendition as EpubRendition;
        setEpubRendition(rendition as unknown as import('@/store/useStore').Rendition);
        setIsReaderReady(true);

        try { rendition.themes.fontSize(`${zoomLevel}%`); } catch { /* silent */ }

        // ── Content hook: runs inside every iframe epubjs creates ─────────────
        rendition.hooks.content.register((contents: { document: Document; window: Window }) => {
            const doc = contents.document;
            const win = contents.window;
            if (!doc || !win) return;

            // ── Typography ─────────────────────────────────────────────────────
            const style = doc.createElement('style');
            style.textContent = `
                html, body {
                    font-family: 'Lora', Georgia, serif !important;
                    line-height: 1.8 !important;
                    padding: 0 8px !important;
                    overflow: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                    touch-action: pan-y !important;
                    -webkit-user-select: text !important;
                    user-select: text !important;
                    -webkit-touch-callout: default !important;
                    cursor: text !important;
                }
                p { line-height: 1.8 !important; margin-bottom: 1em !important; }
                * { max-width: 100% !important; box-sizing: border-box !important; }
                img { height: auto !important; }
            `;
            doc.head.appendChild(style);

            // ── 1. Text selection handler ──────────────────────────────────────
            let selTimeout: ReturnType<typeof setTimeout>;
            const handleSelection = () => {
                clearTimeout(selTimeout);
                selTimeout = setTimeout(() => {
                    try {
                        const sel = win.getSelection();
                        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
                            // Don't reset — tap-to-translate already set it
                            return;
                        }
                        const text = sel.toString().trim();
                        if (!text) return;

                        const range = sel.getRangeAt(0);
                        const rect = range.getBoundingClientRect();
                        const iframe = findIframe(win, containerRef.current);
                        if (!iframe) return;

                        const iframeRect = iframe.getBoundingClientRect();
                        setSelectedText(text);
                        setSelectionPosition({
                            x: iframeRect.left + rect.left + rect.width / 2,
                            y: iframeRect.top + rect.top,
                        });
                    } catch (e) {
                        console.error("EPUB selection error:", e);
                    }
                }, 100);
            };

            doc.addEventListener('selectionchange', handleSelection, false);
            doc.addEventListener('mouseup', handleSelection, false);

            // ── 2. Tap-to-translate (single tap → word) ────────────────────────
            // Track if it was a move (not a tap)
            let tapMoved = false;
            let tapT0 = 0;
            let tapX0 = 0, tapY0 = 0;

            doc.addEventListener('touchstart', (e: Event) => {
                const te = e as TouchEvent;
                if (te.touches.length === 1) {
                    tapMoved = false;
                    tapT0 = Date.now();
                    tapX0 = te.touches[0].clientX;
                    tapY0 = te.touches[0].clientY;
                }
            }, { passive: true });

            doc.addEventListener('touchmove', (e: Event) => {
                const te = e as TouchEvent;
                if (te.touches.length === 1) {
                    const dx = Math.abs(te.touches[0].clientX - tapX0);
                    const dy = Math.abs(te.touches[0].clientY - tapY0);
                    if (dx > 8 || dy > 8) tapMoved = true;
                }
            }, { passive: true });

            doc.addEventListener('click', (e: Event) => {
                const me = e as MouseEvent;
                const dt = Date.now() - tapT0;

                // Skip if it was a drag/swipe, or a long press (> 600 ms)
                if (tapMoved || dt > 600) { tapMoved = false; return; }

                // Skip if text already selected
                const sel = win.getSelection();
                if (sel && !sel.isCollapsed && sel.toString().trim().length > 1) return;

                // Get caret range at click position
                let range: Range | null = null;
                if ('caretRangeFromPoint' in doc) {
                    range = (doc as any).caretRangeFromPoint(me.clientX, me.clientY);
                } else if ('caretPositionFromPoint' in doc) {
                    const pos = (doc as any).caretPositionFromPoint(me.clientX, me.clientY);
                    if (pos) {
                        range = (doc as Document).createRange();
                        range.setStart(pos.offsetNode, pos.offset);
                        range.collapse(true);
                    }
                }
                if (!range) return;

                const word = expandToWord(range, doc);
                if (!word || word.length < 2) return;

                const rect = range.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) return;

                const iframe = findIframe(win, containerRef.current);
                if (!iframe) return;
                const iframeRect = iframe.getBoundingClientRect();

                setSelectedText(word);
                setSelectionPosition({
                    x: iframeRect.left + rect.left + rect.width / 2,
                    y: iframeRect.top + rect.top,
                });
            });

            // ── 3. Swipe L/R → chapter navigation ─────────────────────────────
            let swipeX0 = 0, swipeY0 = 0, swipeT0 = 0;

            doc.addEventListener('touchstart', (e: Event) => {
                const te = e as TouchEvent;
                if (te.touches.length === 1) {
                    swipeX0 = te.touches[0].clientX;
                    swipeY0 = te.touches[0].clientY;
                    swipeT0 = Date.now();
                }
            }, { passive: true });

            doc.addEventListener('touchend', (e: Event) => {
                const te = e as TouchEvent;
                if (te.changedTouches.length !== 1) return;
                const dx = te.changedTouches[0].clientX - swipeX0;
                const dy = te.changedTouches[0].clientY - swipeY0;
                const dt = Date.now() - swipeT0;

                // Fast horizontal swipe: < 350ms, |dx| > 65px, more H than V
                if (dt < 350 && Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 2) {
                    if (dx < 0) renditionRef.current?.next();
                    else renditionRef.current?.prev();
                }
            }, { passive: true });

            // ── 4. Pinch-to-zoom (2 fingers → font size) ──────────────────────
            let pinchDist0 = 0;
            let pinchZoom0 = 100;

            doc.addEventListener('touchstart', (e: Event) => {
                const te = e as TouchEvent;
                if (te.touches.length === 2) {
                    const dx = te.touches[0].clientX - te.touches[1].clientX;
                    const dy = te.touches[0].clientY - te.touches[1].clientY;
                    pinchDist0 = Math.sqrt(dx * dx + dy * dy);
                    pinchZoom0 = useStore.getState().zoomLevel;
                }
            }, { passive: true });

            doc.addEventListener('touchmove', (e: Event) => {
                const te = e as TouchEvent;
                if (te.touches.length === 2) {
                    te.preventDefault(); // Prevent browser zoom
                    const dx = te.touches[0].clientX - te.touches[1].clientX;
                    const dy = te.touches[0].clientY - te.touches[1].clientY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (pinchDist0 === 0) return;
                    const newZoom = Math.max(50, Math.min(200, Math.round(pinchZoom0 * (dist / pinchDist0))));
                    useStore.getState().setZoomLevel(newZoom);
                }
            }, { passive: false });
        });

        // ── epub.js native 'selected' event (secondary handler) ───────────────
        rendition.on('selected', (cfiRange: string, contents: any) => {
            try {
                const win = contents.window;
                const sel = win.getSelection();
                if (!sel || sel.rangeCount === 0) return;
                const text = sel.toString().trim();
                if (!text) return;

                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const iframe = findIframe(win, containerRef.current);
                const iframeRect = iframe ? iframe.getBoundingClientRect() : { left: 0, top: 0 };

                setSelectedText(text);
                setSelectionPosition({
                    x: iframeRect.left + rect.left + rect.width / 2,
                    y: iframeRect.top + rect.top,
                });
            } catch (e) {
                console.error("Native epub selected error:", e);
            }
        });

        if (currentLocation) {
            try { rendition.display(currentLocation); } catch { /* silent */ }
        }

        // Location generation
        const book = rendition.book;
        if (book?.spine?.items?.length > LARGE_BOOK_SPINE_THRESHOLD) isLargeBookRef.current = true;

        if (book?.ready) {
            book.ready
                .then(() => { try { return rendition.locations.generate(1600); } catch { return []; } })
                .then((locations: { length: number } | Array<unknown> | undefined) => {
                    if (locations) setTotalPages((locations as { length: number }).length);
                })
                .catch(() => { /* optional */ });
        }
    }, [currentLocation, setTotalPages, setSelectedText, setSelectionPosition, setEpubRendition, zoomLevel]);

    // ─────────────────────────────────────────────────────────────────────────

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
            {/* Top reader bar: title + progress */}
            <ReaderTopBar />

            {/* Loading overlay */}
            {!isReaderReady && (
                <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
                    style={{ background: 'var(--bg-surface)' }}
                >
                    <div
                        className="p-4 rounded-2xl"
                        style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}
                    >
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--teal)' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.loadingEpub}</p>
                </div>
            )}

            <ReactReader
                url={epubData}
                location={location}
                locationChanged={onLocationChanged}
                getRendition={handleRendition}
                tocChanged={setToc}
                epubOptions={epubOptions}
                // @ts-expect-error - partial styles OK at runtime
                readerStyles={{
                    container: { overflow: 'hidden', height: '100%', position: 'relative' },
                    readerArea: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
                }}
            />

            {/* Hide ReactReader's default navigation chrome */}
            <style jsx global>{`
                .react-reader-footer,
                button[title="Close table of content"],
                button[title="Table of content"] {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
