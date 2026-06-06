'use client';

import { useStore } from '@/store/useStore';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, List, X, Languages } from 'lucide-react';
import { useEffect, useCallback, useMemo } from 'react';
import translations from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomBarProps {
    toggleSidebar: () => void;
}

export default function BottomBar({ toggleSidebar }: BottomBarProps) {
    const {
        currentPage, setCurrentPage, totalPages,
        fileType, currentFile,
        epubRendition,
        zoomLevel, setZoomLevel,
        clearFile, uiLanguage,
        isBilingualMode, setBilingualMode,
    } = useStore();

    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);

    // Navigation
    const handlePrevPage = useCallback(() => {
        if (fileType === 'pdf') setCurrentPage(Math.max(1, currentPage - 1));
        if (fileType === 'epub') epubRendition?.prev();
    }, [fileType, currentPage, setCurrentPage, epubRendition]);

    const handleNextPage = useCallback(() => {
        if (fileType === 'pdf') setCurrentPage(currentPage + 1);
        if (fileType === 'epub') epubRendition?.next();
    }, [fileType, currentPage, setCurrentPage, epubRendition]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setCurrentPage(value);
    };

    // Zoom handlers
    const handleZoomOut = useCallback(() => {
        setZoomLevel(zoomLevel - 10);
    }, [zoomLevel, setZoomLevel]);

    const handleZoomIn = useCallback(() => {
        setZoomLevel(zoomLevel + 10);
    }, [zoomLevel, setZoomLevel]);

    // Keyboard navigation + zoom
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevPage();
            if (e.key === 'ArrowRight') handleNextPage();
            if (e.key === '+' || (e.metaKey && e.key === '=')) {
                e.preventDefault();
                handleZoomIn();
            }
            if (e.key === '-' || (e.metaKey && e.key === '-')) {
                e.preventDefault();
                handleZoomOut();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrevPage, handleNextPage, handleZoomIn, handleZoomOut]);

    if (!currentFile) return null;

    return (
        <AnimatePresence>
        <motion.div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-1.5rem)] sm:w-auto"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280, mass: 0.7 }}
        >
            <div
                className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 rounded-2xl sm:min-w-[420px]"
                style={{
                    background: 'rgba(10, 10, 25, 0.92)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
            >
                {/* Sidebar Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="p-2.5 rounded-xl transition-all duration-150 active:scale-95"
                    style={{ color: 'var(--text-muted)' }}
                    title={t.tableOfContents}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--accent-hover)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    }}
                >
                    <List size={18} />
                </button>

                {/* Divider */}
                <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

                {/* Navigation Group */}
                <div className="flex items-center gap-1">
                    <button
                        className="p-2.5 rounded-xl transition-all duration-150 active:scale-95"
                        style={{ color: 'var(--text-muted)' }}
                        onClick={handlePrevPage}
                        disabled={currentPage === 1 && fileType === 'pdf'}
                        title={t.previousPage}
                        onMouseEnter={e => {
                            if (!(e.currentTarget as HTMLButtonElement).disabled) {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--accent-hover)';
                            }
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        }}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div
                        className="flex flex-col items-center justify-center select-none px-2 sm:px-4 group"
                        style={{ minWidth: '100px', maxWidth: '160px', flex: 1 }}
                    >
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">
                                {fileType === 'pdf' ? t.page : t.reading}
                            </span>
                            <span className="text-xs font-bold font-reading text-white">
                                {currentPage} <span className="text-white/40">/ {totalPages || '—'}</span>
                            </span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={totalPages || 100}
                            value={currentPage}
                            onChange={handleSliderChange}
                            disabled={!totalPages || totalPages <= 1}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer hover:bg-indigo-500/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                accentColor: '#818cf8',
                            }}
                            title={`Página ${currentPage} de ${totalPages}`}
                        />
                    </div>

                    <button
                        className="p-2.5 rounded-xl transition-all duration-150 active:scale-95"
                        style={{ color: 'var(--text-muted)' }}
                        onClick={handleNextPage}
                        title={t.nextPage}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--accent-hover)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Divider — hidden on mobile */}
                <div className="hidden sm:block" style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

                {/* Zoom Controls — hidden on mobile (use pinch-to-zoom) */}
                <div className="hidden sm:flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 50}
                        className="p-2.5 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-30"
                        style={{ color: 'var(--text-muted)' }}
                        title={t.zoomOut}
                        onMouseEnter={e => {
                            if (!(e.currentTarget as HTMLButtonElement).disabled) {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(20,184,166,0.15)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--teal-hover)';
                            }
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        }}
                    >
                        <ZoomOut size={16} />
                    </button>

                    <span
                        className="text-xs font-bold tabular-nums px-2"
                        style={{ color: 'var(--text-secondary)', minWidth: '40px', textAlign: 'center' }}
                    >
                        {zoomLevel}%
                    </span>

                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 200}
                        className="p-2.5 rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-30"
                        style={{ color: 'var(--text-muted)' }}
                        title={t.zoomIn}
                        onMouseEnter={e => {
                            if (!(e.currentTarget as HTMLButtonElement).disabled) {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(20,184,166,0.15)';
                                (e.currentTarget as HTMLElement).style.color = 'var(--teal-hover)';
                            }
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        }}
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>

                {/* Bilingual toggle — txt and epub — hidden on mobile */}
                {(fileType === 'txt' || fileType === 'epub') && (
                    <div className="hidden sm:flex items-center">
                        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                        <button
                            onClick={() => setBilingualMode(!isBilingualMode)}
                            className="p-2.5 rounded-xl transition-all duration-150 active:scale-95"
                            style={{
                                color: isBilingualMode ? 'var(--accent-hover)' : 'var(--text-muted)',
                                background: isBilingualMode ? 'rgba(99,102,241,0.18)' : 'transparent',
                                border: isBilingualMode ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                            }}
                            title={isBilingualMode ? 'Desactivar modo bilingüe' : 'Modo bilingüe (original + traducción)'}
                        >
                            <Languages size={16} />
                        </button>
                    </div>
                )}

                {/* Divider */}
                <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

                {/* Close Book */}
                <button
                    onClick={clearFile}
                    className="p-2.5 rounded-xl transition-all duration-150 active:scale-95"
                    style={{ color: 'var(--text-muted)' }}
                    title={t.closeBook}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)';
                        (e.currentTarget as HTMLElement).style.color = '#f87171';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    }}
                >
                    <X size={16} />
                </button>
            </div>
        </motion.div>
        </AnimatePresence>
    );
}
