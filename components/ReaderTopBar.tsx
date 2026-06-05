'use client';

import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

function extractTitle(file: File | string | null): string {
    if (!file) return '';
    if (file instanceof File) return file.name.replace(/\.[^/.]+$/, '');
    try {
        const url = new URL(file);
        const seg = url.pathname.split('/').filter(Boolean).pop() || '';
        return decodeURIComponent(seg).replace(/\.[^/.]+$/, '');
    } catch {
        const seg = (file as string).split('/').filter(Boolean).pop() || '';
        return seg.replace(/\.[^/.]+$/, '');
    }
}

export default function ReaderTopBar() {
    const { currentFile, currentPage, totalPages, fileType, zoomLevel } = useStore();

    if (!currentFile) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const title = useMemo(() => extractTitle(currentFile), [currentFile]);
    const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 left-0 right-0 z-20 flex flex-col pointer-events-none select-none"
            style={{
                background: 'linear-gradient(to bottom, rgba(8,8,20,0.88) 0%, rgba(8,8,20,0) 100%)',
            }}
        >
            <div className="flex items-center justify-between px-4 pt-2 pb-4">
                {/* Book title */}
                <span
                    className="text-xs font-semibold truncate"
                    style={{ color: 'var(--text-secondary)', maxWidth: '55%' }}
                    title={title}
                >
                    {title}
                </span>

                {/* Right info: zoom + page + progress */}
                <div className="flex items-center gap-3">
                    {/* Zoom */}
                    <span
                        className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-md"
                        style={{
                            color: 'var(--text-muted)',
                            background: 'rgba(255,255,255,0.06)',
                        }}
                    >
                        {zoomLevel}%
                    </span>

                    {/* Page counter */}
                    {totalPages > 0 && (
                        <span
                            className="text-[10px] tabular-nums"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {currentPage}
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}> / </span>
                            {totalPages}
                        </span>
                    )}

                    {/* Progress % */}
                    {progress > 0 && (
                        <span
                            className="text-[10px] font-bold tabular-nums"
                            style={{ color: 'var(--accent-hover)' }}
                        >
                            {progress}%
                        </span>
                    )}

                    {/* File type badge — only for TXT (others obvious) */}
                    {fileType === 'txt' && (
                        <span
                            className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                                background: 'rgba(20,184,166,0.15)',
                                color: 'var(--teal)',
                                border: '1px solid rgba(20,184,166,0.25)',
                            }}
                        >
                            TXT
                        </span>
                    )}
                </div>
            </div>

            {/* Thin progress bar */}
            {totalPages > 0 && (
                <div
                    className="h-[2px] w-full absolute bottom-0 left-0"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, var(--accent) 0%, var(--teal) 100%)',
                            originX: 0,
                        }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            )}
        </motion.div>
    );
}
