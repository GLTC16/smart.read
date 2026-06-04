'use client';

import { useStore } from '@/store/useStore';
import { useEffect, useState, useRef } from 'react';
import PageCounter from './PageCounter';

export default function TXTViewer() {
    const {
        currentFile, setSelectedText,
        setSelectionPosition, resetSelection,
        zoomLevel,
    } = useStore();
    const [content, setContent] = useState<string>('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load TXT file content
    useEffect(() => {
        if (!currentFile) return;
        setIsLoading(true);
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
                setContent('Error al cargar el archivo. Por favor, inténtalo de nuevo.');
            } finally {
                setIsLoading(false);
            }
        };
        loadContent();
    }, [currentFile]);

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
    const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
    const fontSize = `calc(1.125rem * ${zoomLevel} / 100)`;

    return (
        <div
            ref={containerRef}
            className="flex justify-center min-h-screen overflow-auto"
            style={{ background: 'var(--bg-surface)' }}
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
                    <article
                        className="rounded-2xl p-8 md:p-12"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
                            animation: 'scaleIn 0.3s ease forwards',
                        }}
                    >
                        {paragraphs.map((para, i) => (
                            <p
                                key={i}
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
                )}
            </div>
            <PageCounter current={scrollProgress} total={100} type="percent" />
        </div>
    );
}
