'use client';

import { useStore } from '@/store/useStore';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, List } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface BottomBarProps {
    toggleSidebar: () => void;
}

export default function BottomBar({ toggleSidebar }: BottomBarProps) {
    const {
        currentPage, setCurrentPage,
        fileType, currentFile,
        epubRendition
    } = useStore();

    // Simplified Navigation
    const handlePrevPage = useCallback(() => {
        if (fileType === 'pdf') setCurrentPage(Math.max(1, currentPage - 1));
        if (fileType === 'epub') epubRendition?.prev();
    }, [fileType, currentPage, setCurrentPage, epubRendition]);

    const handleNextPage = useCallback(() => {
        if (fileType === 'pdf') setCurrentPage(currentPage + 1);
        if (fileType === 'epub') epubRendition?.next();
    }, [fileType, currentPage, setCurrentPage, epubRendition]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevPage();
            if (e.key === 'ArrowRight') handleNextPage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrevPage, handleNextPage]);

    if (!currentFile) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl z-40 p-2 flex items-center justify-between px-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]">

            {/* Sidebar Toggle */}
            <button
                onClick={toggleSidebar}
                className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-all hover:scale-105 active:scale-95"
                title="Table of Contents"
            >
                <List size={20} />
            </button>

            {/* Navigation Group */}
            <div className="flex items-center gap-6">
                <button
                    className="p-3 hover:bg-slate-100 rounded-full text-slate-700 disabled:opacity-30 transition-all active:scale-95"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 && fileType === 'pdf'}
                    title="Previous Page"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex flex-col items-center min-w-[100px] select-none">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        {fileType === 'pdf' ? 'PAGE' : 'READING'}
                    </span>
                    <span className="text-xl font-bold text-slate-800 font-serif leading-none">
                        {fileType === 'pdf' ? currentPage : 'Location'}
                    </span>
                </div>

                <button
                    className="p-3 hover:bg-slate-100 rounded-full text-slate-700 transition-all active:scale-95"
                    onClick={handleNextPage}
                    title="Next Page"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Zoom / Settings Placeholder */}
            <div className="flex gap-2">
                <button className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                    <ZoomOut size={20} />
                </button>
                <button className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                    <ZoomIn size={20} />
                </button>
            </div>

        </div>
    );
}
