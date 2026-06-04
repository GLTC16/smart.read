'use client';

import { useStore } from '@/store/useStore';
import { useEffect, useState, useRef, useMemo } from 'react';
import PageCounter from './PageCounter';
import translations from '@/lib/translations';

// For very large TXT files, we limit rendered paragraphs and paginate
const PARAGRAPHS_PER_PAGE = 200;

export default function TXTViewer() {
    const {
        currentFile, setSelectedText,
        setSelectionPosition, resetSelection,
        zoomLevel, uiLanguage,
    } = useStore();
    const [content, setContent] = useState<string>('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [txtPage, setTxtPage] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);

    // Load TXT file content
    useEffect(() => {
        if (!currentFile) return;
        setIsLoading(true);
        setTxtPage(0);
        const loadContent = async () => {
            try {
                let text = '';
                if (currentFile instanceof File) {
                    text = await currentFile.text();
                } else {
                    const response = await fetch(currentFile);
                    text = await response.text();
                }
                setContent(text);
            } catch (error) {
                console.error('Error loading TXT file:', error);
                setContent(t.txtLoadError);
            } finally {
                setIsLoading(false);
            }
        };
        loadContent();
    }, [currentFile, t.txtLoadError]);

    // Handle text selection — only on mouseup/touchend to avoid spam
    useEffect(() => {
        const handleSelectionEnd = () => {
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

    // Track scroll progress
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
            setScrollProgress(progress);
        };
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    if (!currentFile) return null;

    // Parse paragraphs
    const allParagraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
    const totalTxtPages = Math.ceil(allParagraphs.length / PARAGRAPHS_PER_PAGE);
    const isLargeFile = allParagraphs.length > PARAGRAPHS_PER_PAGE;

    // For large files, only render current page of paragraphs
    const visibleParagraphs = isLargeFile
        ? allParagraphs.slice(txtPage * PARAGRAPHS_PER_PAGE, (txtPage + 1) * PARAGRAPHS_PER_PAGE)
        : allParagraphs;

    const fontSize = `calc(1.125rem * ${zoomLevel} / 100)`;

    return (
        <div
            ref={containerRef}
            className="flex flex-col items-center min-h-screen overflow-auto"
            style={{
                background: 'var(--bg-surface)',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
            }}
        >
            <div
                className="w-full px-6 py-12 pb-32"
                style={{ maxWidth: '672px' }}
            >
                {isLoading ? (
                    /* Loading skeleton */
                    <div
                        className="rounded-2xl p-10"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            animation: 'fadeIn 0.3s ease',
                        }}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    height: '20px',
                                    borderRadius: '6px',
                                    background: 'rgba(255,255,255,0.05)',
                                    width: i % 4 === 3 ? '70%' : '100%',
                                    marginBottom: i % 4 === 3 ? '32px' : '12px',
                                    animation: 'shimmer 1.8s infinite',
                                    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
                                    backgroundSize: '200% 100%',
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Large file pagination controls */}
                        {isLargeFile && (
                            <div
                                className="flex items-center justify-center gap-4 mb-6 py-3 rounded-xl"
                                style={{
                                    background: 'rgba(99,102,241,0.08)',
                                    border: '1px solid rgba(99,102,241,0.15)',
                                }}
                            >
                                <button
                                    onClick={() => { setTxtPage(Math.max(0, txtPage - 1)); containerRef.current?.scrollTo(0, 0); }}
                                    disabled={txtPage === 0}
                                    className="px-4 py-1.5 text-sm font-bold rounded-lg disabled:opacity-30 transition-all"
                                    style={{
                                        background: 'rgba(99,102,241,0.2)',
                                        color: 'var(--accent-hover)',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                    }}
                                >
                                    ← {t.previousPage}
                                </button>
                                <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                                    {txtPage + 1} / {totalTxtPages}
                                </span>
                                <button
                                    onClick={() => { setTxtPage(Math.min(totalTxtPages - 1, txtPage + 1)); containerRef.current?.scrollTo(0, 0); }}
                                    disabled={txtPage >= totalTxtPages - 1}
                                    className="px-4 py-1.5 text-sm font-bold rounded-lg disabled:opacity-30 transition-all"
                                    style={{
                                        background: 'rgba(99,102,241,0.2)',
                                        color: 'var(--accent-hover)',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                    }}
                                >
                                    {t.nextPage} →
                                </button>
                            </div>
                        )}

                        <article
                            className="rounded-2xl p-8 md:p-12"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
                                animation: 'scaleIn 0.3s ease forwards',
                            }}
                        >
                            {visibleParagraphs.map((para, i) => (
                                <p
                                    key={`${txtPage}-${i}`}
                                    className="font-reading"
                                    style={{
                                        fontSize,
                                        lineHeight: 1.85,
                                        color: 'var(--text-secondary)',
                                        marginBottom: '1.5em',
                                        textAlign: 'justify',
                                        transition: 'font-size 0.2s ease',
                                    }}
                                >
                                    {para}
                                </p>
                            ))}
                        </article>

                        {/* Bottom pagination for large files */}
                        {isLargeFile && (
                            <div
                                className="flex items-center justify-center gap-4 mt-6 py-3 rounded-xl"
                                style={{
                                    background: 'rgba(99,102,241,0.08)',
                                    border: '1px solid rgba(99,102,241,0.15)',
                                }}
                            >
                                <button
                                    onClick={() => { setTxtPage(Math.max(0, txtPage - 1)); containerRef.current?.scrollTo(0, 0); }}
                                    disabled={txtPage === 0}
                                    className="px-4 py-1.5 text-sm font-bold rounded-lg disabled:opacity-30 transition-all"
                                    style={{
                                        background: 'rgba(99,102,241,0.2)',
                                        color: 'var(--accent-hover)',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                    }}
                                >
                                    ← {t.previousPage}
                                </button>
                                <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                                    {txtPage + 1} / {totalTxtPages}
                                </span>
                                <button
                                    onClick={() => { setTxtPage(Math.min(totalTxtPages - 1, txtPage + 1)); containerRef.current?.scrollTo(0, 0); }}
                                    disabled={txtPage >= totalTxtPages - 1}
                                    className="px-4 py-1.5 text-sm font-bold rounded-lg disabled:opacity-30 transition-all"
                                    style={{
                                        background: 'rgba(99,102,241,0.2)',
                                        color: 'var(--accent-hover)',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                    }}
                                >
                                    {t.nextPage} →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <PageCounter current={scrollProgress} total={100} type="percent" />
        </div>
    );
}
