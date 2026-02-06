"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { ReactReader } from "react-reader";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";

export default function EpubViewer() {
    const { 
        currentFile, 
        currentLocation, 
        setCurrentLocation,
        setToc,
        setSelectedText,
        setSelectionPosition,
        setCurrentPage,
        setTotalPages
    } = useStore();

    const [location, setLocation] = useState<string | number>(currentLocation || 0);
    const [isReaderReady, setIsReaderReady] = useState(false);
    const renditionRef = useRef<any>(null);

    // SOLUCIÓN SCROLL: Usamos 'paginated' que es más estable en móviles
    const epubOptions = useMemo(() => ({
        flow: "paginated", // Mucho mejor rendimiento que 'scrolled'
        manager: "default",
        width: "100%",
        height: "100%",
    }), []);

    const url = useMemo(() => {
        if (!currentFile) return null;
        return URL.createObjectURL(currentFile);
    }, [currentFile]);

    const onLocationChanged = useCallback((loc: string | number) => {
        setLocation(loc);
        if (typeof loc === "string") {
            setCurrentLocation(loc);
            
            // Calculador de página aproximada
            if (renditionRef.current?.locations?.length() > 0) {
                const current = renditionRef.current.currentLocation();
                if (current?.start) {
                    const page = renditionRef.current.locations.locationFromCfi(current.start.cfi);
                    setCurrentPage(page + 1);
                }
            }
        }
    }, [setCurrentLocation, setCurrentPage]);

    const handleRendition = useCallback((rendition: any) => {
        renditionRef.current = rendition;
        setIsReaderReady(true);

        rendition.themes.default({
            body: { "font-family": "Helvetica, Arial, sans-serif", "font-size": "110%", "padding": "0 10px" },
            p: { "line-height": "1.6" }
        });

        if (currentLocation) rendition.display(currentLocation);

        // Generar páginas para el contador
        rendition.ready.then(() => {
            return rendition.locations.generate(1000);
        }).then((locations: any) => {
            setTotalPages(locations.length);
        });

        // SOLUCIÓN TRADUCCIÓN: Detectar selección DENTRO del Iframe
        rendition.on("selected", (cfiRange: string, contents: any) => {
            const selection = contents.window.getSelection();
            const text = selection.toString().trim();

            if (text) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // Truco matemático: Sumamos la posición del Iframe + la posición del texto
                const iframe = document.querySelector("iframe"); 
                const iframeRect = iframe?.getBoundingClientRect();

                if (iframeRect) {
                    setSelectedText(text);
                    setSelectionPosition({
                        x: iframeRect.left + rect.left + (rect.width / 2),
                        y: iframeRect.top + rect.top
                    });
                }
            }
        });

        // Limpiar selección al tocar en otro lado
        rendition.on("click", () => {
            // Si quieres que se cierre el tooltip al hacer click fuera:
            // useStore.getState().resetSelection(); 
        });

    }, [currentLocation, setTotalPages, setSelectedText, setSelectionPosition]);

    if (!url) return null;

    return (
        <div className="relative w-full h-[80vh] md:h-[85vh] bg-white border rounded-xl overflow-hidden shadow-sm">
            {!isReaderReady && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
