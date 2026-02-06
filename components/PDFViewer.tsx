"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useStore } from "@/store/useStore";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
    const { currentFile, setCurrentPage, setTotalPages, currentPage, totalPages } = useStore();
    const [pageWidth, setPageWidth] = useState(600);
    const containerRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setTotalPages(numPages);
        setCurrentPage(1);
    }

    // TRUCO PRO: Calcular el ancho disponible de la pantalla
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Le restamos un poco de margen (32px) para que no toque los bordes
                setPageWidth(containerRef.current.clientWidth - 20);
            }
        };

        // Medir al inicio y cuando se gire el móvil
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const changePage = (offset: number) => {
        const newPage = currentPage + offset;
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    if (!currentFile) return null;

    return (
        <div ref={containerRef} className="flex flex-col items-center gap-4 relative w-full px-2">
            
            {/* Controles flotantes */}
            <div className="flex justify-between w-full max-w-2xl mb-2">
                <button onClick={() => changePage(-1)} disabled={currentPage <= 1} className="p-2 bg-white rounded-full shadow border disabled:opacity-50">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={() => changePage(1)} disabled={currentPage >= totalPages} className="p-2 bg-white rounded-full shadow border disabled:opacity-50">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-lg bg-gray-500 w-full flex justify-center">
                <Document
                    file={currentFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<Loader2 className="w-10 h-10 animate-spin text-white m-10" />}
                    error={<div className="p-4 text-white">Error cargando PDF.</div>}
                >
                    <Page 
                        pageNumber={currentPage} 
                        scale={1.0}
                        width={pageWidth} // AQUÍ ESTÁ LA MAGIA RESPONSIVE
                        renderTextLayer={true}
                        renderAnnotationLayer={false}
                    />
                </Document>
            </div>
            
            {/* Espacio extra abajo para que el dedo no tape el texto */}
            <div className="h-24"></div>
        </div>
    );
}
