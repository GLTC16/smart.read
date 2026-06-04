'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import PageCounter from './PageCounter';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFSkeleton() {
    return (
        <div
            className="flex flex-col items-center gap-4 w-full pt-10"
            style={{ animation: 'fadeIn 0.3s ease' }}
        >
            <div
                className="rounded-xl"
                style={{
                    width: '600px',
                    maxWidth: '90vw',
                    height: '840px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(20,184,166,0.04) 100%)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Shimmer overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.8s infinite',
                    }}
                />
                {/* Text line skeletons */}
                <div className="p-12 flex flex-col gap-3">
                    {Array.from({ length: 18 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                height: '14px',
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.05)',
                                width: i % 5 === 4 ? '60%' : '100%',
                            }}
                        />
                    ))}
                </div>
            </div>
            <p
                className="text-sm"
                style={{ color: 'var(--text-muted)', animation: 'pulse-glow 2s ease infinite' }}
            >
                Cargando documento…
            </p>
        </div>
    );
}

export default function PDFViewer() {
    const {
        currentFile, currentPage, totalPages,
        setTotalPages, setSelectedText,
        setSelectionPosition, resetSelection,
        zoomLevel,
    } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const [baseWidth, setBaseWidth] = useState(800);
    const [isLoading, setIsLoading] = useState(true);

    const pageWidth = baseWidth * (zoomLevel / 100);

    // Calculate responsive base width
    useEffect(() => {
        const calculateWidth = () => {
            if (typeof window === 'undefined') return;
            setBaseWidth(isMobile ? window.innerWidth - 32 : 800);
        };
        calculateWidth();
        window.addEventListener('resize', calculateWidth);
        return () => window.removeEventListener('resize', calculateWidth);
    }, [isMobile]);

    // Handle text selection
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const text = selection.toString().trim();
            if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) return;
            if (text) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setSelectionPosition({ x: rect.left + rect.width / 2, y: rect.top });
                setSelectedText(text);
            }
        };

        const handleClearSelection = () => {
            const selection = window.getSelection();
            if (selection?.isCollapsed) resetSelection();
        };

        document.addEventListener('selectionchange', handleSelection);
        document.addEventListener('mouseup', handleClearSelection);
        document.addEventListener('touchend', handleClearSelection);

        return () => {
            document.removeEventListener('selectionchange', handleSelection);
            document.removeEventListener('mouseup', handleClearSelection);
            document.removeEventListener('touchend', handleClearSelection);
        };
    }, [setSelectedText, setSelectionPosition, resetSelection]);

    const fileUrl = (() => {
        if (!currentFile) return null;
        if (currentFile instanceof File) return URL.createObjectURL(currentFile);
        return currentFile as string;
    })();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setTotalPages(numPages);
        setIsLoading(false);
    }

    if (!fileUrl) return null;

    return (
        <div
            ref={containerRef}
            className="flex justify-center min-h-screen pt-8 pb-32 overflow-auto relative"
            style={{ background: 'var(--bg-surface)' }}
        >
            {isLoading && <PDFSkeleton />}
            <div
                style={{
                    display: isLoading ? 'none' : 'block',
                    transition: 'opacity 0.3s ease',
                    animation: isLoading ? 'none' : 'scaleIn 0.3s ease forwards',
                }}
            >
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="shadow-2xl"
                    loading={<PDFSkeleton />}
                >
                    <Page
                        pageNumber={currentPage}
                        width={pageWidth}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="rounded-lg overflow-hidden"
                    />
                </Document>
            </div>
            <PageCounter current={currentPage} total={totalPages} type="page" />
        </div>
    );
}
