'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ReactReader } from "react-reader";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";
import PageCounter from './PageCounter';

export default function EpubViewer() {
    const {
        currentFile,
        currentLocation,
        setCurrentLocation,
        setToc,
        totalPages,
        setTotalPages,
        setSelectedText,
        setSelectionPosition,
        resetSelection
    } = useStore();

    const [location, setLocation] = useState<string | number>(currentLocation || 0);
    const [getRendition, setGetRendition] = useState<any>(null);
    const [isReaderReady, setIsReaderReady] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(1);

    const containerRef = useRef<HTMLDivElement>(null);

    // 1. SOLUCIÓN CRÍTICA: useMemo para evitar el bucle infinito
    const epubOptions = useMemo(() => ({
        flow: "scrolled",
        manager: "continuous",
        width: "100%",
        height: "100%",
    }), []);

    const epubInitOptions = useMemo(() => ({
        openAs: "epub",
    }), []);

    // Convertir el archivo a URL
    const url = useMemo(() => {
        if (!currentFile) return null;
        // If it's already a string (URL), return it directly
        if (typeof currentFile === 'string') return currentFile;
        // If it's a File object, create an object URL
        return URL.createObjectURL(currentFile);
    }, [currentFile]);

    // Manejador de cambio de ubicación (con debounce suave)
    const onLocationChanged = useCallback((loc: string | number) => {
        setLocation(loc);
        if (typeof loc === "string") {
            setCurrentLocation(loc);
        }
    }, [setCurrentLocation]);

    // Handle TOC to track chapters
    const onTocChanged = useCallback((toc: any[]) => {
        setToc(toc);
        setTotalPages(toc.length); // Use TOC length as total chapters
    }, [setToc, setTotalPages]);

    // Configuración cuando el libro está listo
    const handleRendition = useCallback((rendition: any) => {
        setGetRendition(rendition);
        setIsReaderReady(true);

        // Estilos para que se lea bien
        rendition.themes.default({
            body: {
                "font-family": "Helvetica, Arial, sans-serif",
                "font-size": "110%",
                "padding": "0 20px"
            },
            p: {
                "line-height": "1.6"
            },
            "::selection": {
                "background": "rgba(255, 255, 0, 0.3)"
            }
        });

        // 3. SELECTION HANDLING
        rendition.on("selected", (cfiRange: string, contents: any) => {
            const range = contents.range(cfiRange);
            const text = range.toString().trim();

            if (text) {
                // Get the bounding rectangle of the selection in the iframe
                const rect = range.getBoundingClientRect();

                // We need to account for the iframe's position in the main window
                // Since react-reader puts the content in an iframe
                const iframe = containerRef.current?.querySelector('iframe');
                const iframeRect = iframe?.getBoundingClientRect();

                if (iframeRect) {
                    setSelectionPosition({
                        x: rect.left + iframeRect.left + (rect.width / 2),
                        y: rect.top + iframeRect.top
                    });
                    setSelectedText(text);
                }
            } else {
                resetSelection();
            }
        });

        // Clear selection when clicking on the rendition
        rendition.on("mousedown", () => {
            resetSelection();
        });

        // Cargar ubicación guardada si existe
        if (currentLocation) {
            rendition.display(currentLocation);
        }
    }, [currentLocation]);

    if (!url) return null;

    return (
        // 2. SOLUCIÓN CRÍTICA: Altura explícita
        <div ref={containerRef} className="relative w-full h-[85vh] bg-white border rounded-xl overflow-hidden shadow-sm">

            {!isReaderReady && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-gray-500 font-medium">Cargando libro...</span>
                    </div>
                </div>
            )}

            <ReactReader
                url={url as any}
                location={location}
                locationChanged={onLocationChanged}
                getRendition={handleRendition}
                tocChanged={onTocChanged}
                epubInitOptions={epubInitOptions}
                epubOptions={epubOptions}
            />
            {totalPages > 0 && (
                <PageCounter current={currentChapter} total={totalPages} type="chapter" />
            )}
        </div>
    );
}