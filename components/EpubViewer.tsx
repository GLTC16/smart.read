"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { ReactReader } from "react-reader";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";

type EpubLocation = string | number;
type EpubRendition = {
    themes: {
        default: (theme: Record<string, Record<string, string>>) => void;
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
};
type EpubContents = {
    window: Window;
};

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
    } = useStore();

    const [location, setLocation] = useState<EpubLocation>(currentLocation || 0);
    const [isReaderReady, setIsReaderReady] = useState(false);
    const renditionRef = useRef<EpubRendition | null>(null);

    // Paginated mode for best compatibility
    const epubOptions = useMemo(() => ({
        flow: "paginated",
        manager: "default",
        width: "100%",
        height: "100%",
    }), []);

    const url = useMemo(() => {
        if (!currentFile) return null;
        try {
            if (currentFile instanceof File) return URL.createObjectURL(currentFile);
            return currentFile as string;
        } catch (error) {
            console.error("Error creando URL del EPUB:", error);
            return null;
        }
    }, [currentFile]);

    const onLocationChanged = useCallback((loc: EpubLocation) => {
        setLocation(loc);
        if (typeof loc === "string") {
            setCurrentLocation(loc);
            try {
                if ((renditionRef.current?.locations?.length() ?? 0) > 0) {
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

        // Apply a comfortable reading theme
        rendition.themes.default({
            body: {
                "font-family": "'Lora', Georgia, serif",
                "font-size": "110%",
                "padding": "0 16px",
                "color": "#e2e0f0",
                "background": "#0f0f1a",
                "line-height": "1.8",
            },
            p: { "line-height": "1.8", "margin-bottom": "1em" },
            a: { "color": "#818cf8" },
        });

        if (currentLocation) {
            try { rendition.display(currentLocation); } catch { /* silent */ }
        }

        rendition.ready.then(() => {
            try { return rendition.locations.generate(1000); } catch { return []; }
        }).then((locations: { length: number } | Array<unknown> | undefined) => {
            if (locations) setTotalPages((locations as { length: number }).length);
        });

        // Text selection for translation
        rendition.on("selected", (_cfiRange: string, contents: EpubContents) => {
            try {
                const selection = contents.window.getSelection();
                if (!selection) return;
                const text = selection.toString().trim();
                if (text) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    const iframe = document.querySelector("div.react-reader iframe");
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
    }, [currentLocation, setTotalPages, setSelectedText, setSelectionPosition, setEpubRendition]);

    if (!url) {
        return (
            <div
                className="flex items-center justify-center h-full text-sm"
                style={{ color: 'var(--text-muted)' }}
            >
                Error al cargar el archivo.
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full"
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
                        Cargando EPUB…
                    </p>
                </div>
            )}

            <ReactReader
                url={url}
                location={location}
                locationChanged={onLocationChanged}
                getRendition={handleRendition}
                tocChanged={setToc}
                epubOptions={epubOptions}
            />
        </div>
    );
}
