"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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

    // OPCIONES: Usamos 'paginated' para mejor rendimiento en móviles
    const epubOptions = useMemo(() => ({
        flow: "paginated", 
        manager: "default",
        width: "100%",
        height: "100%",
    }), []);

    // --- CORRECCIÓN DEL ERROR DE BUILD ---
    // Verificamos explícitamente que sea un File antes de usar createObjectURL
    const url = useMemo(() => {
        if (!currentFile) return null;
        
        if (currentFile instanceof File) {
            return URL.createObjectURL(currentFile);
        }
        
        // Si por alguna razón es un string, lo devolvemos tal cual para que TS no se queje
        return currentFile as string;
    }, [currentFile]);

    const onLocationChanged = useCallback((loc: string | number) => {
        setLocation(loc);
        if (typeof loc === "string") {
            setCurrentLocation(loc);
            
            // Calcular número de página aproximado
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

        // Estilos para lectura cómoda
        rendition.themes.default({
            body: { 
                "font-family": "Helvetica, Arial, sans-serif", 
                "font-size": "110%", 
                "padding": "0 10px" 
            },
            p: { "line-height": "1.6" }
        });

        if (currentLocation) rendition.display(currentLocation);

        // Generar paginación (puede tardar un poco)
        rendition.ready.then(() => {
            return rendition.locations.generate(1000);
        }).then((locations: any) => {
            setTotalPages(locations.length);
        });

        // --- LÓGICA DE TRADUCCIÓN PARA IFRAME ---
        rendition.on("selected", (cfiRange: string, contents: any) => {
            const selection = contents.window.getSelection();
            const text = selection.toString().trim();

            if (text) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // Calculamos la posición real sumando el offset del iframe
                const iframe = document.querySelector("div.react-reader iframe"); 
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

        // Limpiar selección al tocar fuera (opcional)
        rendition.on("click", () => {
             // Si deseas limpiar la selección al hacer click:
             // setSelectedText("");
             // setSelectionPosition(null);
        });

    }, [currentLocation, setTotalPages, setSelectedText, setSelectionPosition]);

    if (!url) return null;

    return (
        <div className="relative w-full h-[80vh] md:h-[85vh] bg-white border rounded-xl overflow-hidden shadow-sm">
            {!isReaderReady && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-500 font-medium">Cargando libro...</span>
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
