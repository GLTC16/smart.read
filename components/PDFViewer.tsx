'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import translations from '@/lib/translations';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure Worker — served locally to avoid CDN/CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function PDFSkeleton({ loadingText }: { loadingText: string }) {
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
                {loadingText}
            </p>
        </div>
    );
}

export default function PDFViewer() {
    const {
        currentFile, currentPage, totalPages,
        setCurrentPage, setTotalPages, setSelectedText,
        setSelectionPosition, resetSelection,
        zoomLevel, uiLanguage,
    } = useStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const isMobile = useIsMobile();
    const [baseWidth, setBaseWidth] = useState(800);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);
    const pageWidth = baseWidth * (zoomLevel / 100);

    // Calculate responsive base width
    useEffect(() => {
        const calculateWidth = () => {
            if (typeof window === 'undefined') return;
            setBaseWidth(isMobile ? window.innerWidth : 800);
        };
        calculateWidth();
        window.addEventListener('resize', calculateWidth);
        return () => window.removeEventListener('resize', calculateWidth);
    }, [isMobile]);

    useEffect(() => {
        const handleSelectionEnd = (e: Event) => {
            // Ignore if the click was inside the translation tooltip
            if (e.target && (e.target as Element).closest('#translation-tooltip')) return;

            // Small delay to let the selection finalize
            setTimeout(() => {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) return;
                const text = selection.toString().trim();
                if (text) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setSelectionPosition({ x: rect.left + rect.width / 2, y: rect.top });
                    setSelectedText(text);
                } else {
                    resetSelection();
                }
            }, 50);
        };

        document.addEventListener('mouseup', handleSelectionEnd);
        document.addEventListener('touchend', handleSelectionEnd);

        return () => {
            document.removeEventListener('mouseup', handleSelectionEnd);
            document.removeEventListener('touchend', handleSelectionEnd);
        };
    }, [setSelectedText, setSelectionPosition, resetSelection]);

    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!currentFile) {
            setFileUrl(null);
            return;
        }
        
        let url: string;
        let isObjectUrl = false;

        if (currentFile instanceof File) {
            url = URL.createObjectURL(currentFile);
            isObjectUrl = true;
        } else {
            url = currentFile as string;
        }

        setFileUrl(url);

        return () => {
            if (isObjectUrl) {
                URL.revokeObjectURL(url);
            }
        };
    }, [currentFile]);

    // Reset loading state when file changes
    useEffect(() => {
        setIsLoading(true);
        setLoadError(null);
    }, [fileUrl]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        // setIsLoading first to avoid Zustand useSyncExternalStore race
        setIsLoading(false);
        setTotalPages(numPages);
    }

    function onDocumentLoadError(error: Error) {
        console.error('PDF load error:', error);
        setIsLoading(false);
        setLoadError(t.pdfLoadError);
    }

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        
        // Prevent page turn if user is selecting text
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
            return;
        }

        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        // Only trigger on clear horizontal swipe
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) setCurrentPage(Math.min(totalPages, currentPage + 1));
            else setCurrentPage(Math.max(1, currentPage - 1));
        }
        touchStartX.current = null;
        touchStartY.current = null;
    }, [currentPage, totalPages, setCurrentPage]);

    if (!fileUrl) return null;

    return (
        // Outer fills the BookViewer box (absolute inset-0), inner scrolls
        <div
            className="absolute inset-0 overflow-auto"
            style={{
                background: 'var(--bg-surface)',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x pan-y pinch-zoom',
            }}
        >
            <div
                ref={containerRef}
                className="flex justify-center pt-8 pb-32 relative w-full"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Skeleton overlaid on top while loading — Document always rendered */}
                {isLoading && (
                    <div className="absolute inset-0 z-10" style={{ background: 'var(--bg-surface)' }}>
                        <PDFSkeleton loadingText={t.loadingDocument} />
                    </div>
                )}
                {loadError ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center">
                        <div
                            className="p-4 rounded-2xl"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <p className="text-sm font-medium" style={{ color: '#f87171' }}>{loadError}</p>
                    </div>
                ) : (
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        className="shadow-2xl"
                        loading={null}
                    >
                        <Page
                            pageNumber={currentPage}
                            width={pageWidth}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="rounded-lg overflow-hidden"
                        />
                    </Document>
                )}
            </div>
        </div>
    );
}
