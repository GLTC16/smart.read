'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useStore } from '@/store/useStore';
import { useMemo, useEffect, useRef } from 'react';
import PageCounter from './PageCounter';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
    const { currentFile, currentPage, totalPages, setTotalPages, setSelectedText, setSelectionPosition } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle Selection in PDF
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const text = selection.toString().trim();

            // Check if selection is inside our PDF container
            if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) {
                return;
            }

            if (text) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Store relative to viewport
                setSelectionPosition({
                    x: rect.left + (rect.width / 2),
                    y: rect.top
                });
                setSelectedText(text);
            }
        };

        // We listen on the document because the selection might start inside but events bubble up.
        // Actually 'selectionchange' is a document-level event.
        document.addEventListener('selectionchange', handleSelection);

        // Also handle clearing when clicking away
        const handleClick = () => {
            const selection = window.getSelection();
            if (selection?.isCollapsed) {
                setSelectedText(null);
                setSelectionPosition(null);
            }
        };
        document.addEventListener('mouseup', handleClick);

        return () => {
            document.removeEventListener('selectionchange', handleSelection);
            document.removeEventListener('mouseup', handleClick);
        };
    }, [setSelectedText, setSelectionPosition]);

    const fileUrl = useMemo(() => {
        if (currentFile instanceof File) {
            return URL.createObjectURL(currentFile);
        }
        return currentFile as string;
    }, [currentFile]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setTotalPages(numPages);
    }

    return (
        <div
            ref={containerRef}
            className="flex justify-center bg-slate-100 min-h-screen pt-8 pb-32 overflow-auto relative custom-scrollbar"
        >
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="shadow-xl"
            >
                <Page
                    pageNumber={currentPage}
                    width={800}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="mb-8"
                />
            </Document>
            <PageCounter current={currentPage} total={totalPages} type="page" />
        </div>
    );
}
