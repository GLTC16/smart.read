'use client';

import { useStore } from '@/store/useStore';
import { useMemo, useEffect, useState, useRef } from 'react';
import PageCounter from './PageCounter';

export default function TXTViewer() {
    const { currentFile, setSelectedText, setSelectionPosition } = useStore();
    const [content, setContent] = useState<string>('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load TXT file content
    useEffect(() => {
        if (!currentFile) return;

        const loadContent = async () => {
            try {
                let text = '';
                if (currentFile instanceof File) {
                    text = await currentFile.text();
                } else {
                    // If it's a URL/string
                    const response = await fetch(currentFile);
                    text = await response.text();
                }
                setContent(text);
            } catch (error) {
                console.error('Error loading TXT file:', error);
                setContent('Error loading file. Please try again.');
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

            // Check if selection is inside our container
            if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) {
                return;
            }

            if (text) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                setSelectionPosition({
                    x: rect.left + (rect.width / 2),
                    y: rect.top
                });
                setSelectedText(text);
            }
        };

        document.addEventListener('selectionchange', handleSelection);

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

    return (
        <div
            ref={containerRef}
            className="flex justify-center bg-slate-50 min-h-screen overflow-auto custom-scrollbar"
        >
            <div className="max-w-4xl w-full px-8 py-12 pb-32">
                <div className="bg-white shadow-lg rounded-lg p-8 md:p-12">
                    <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-700">
                        {content}
                    </pre>
                </div>
            </div>
            <PageCounter current={scrollProgress} total={100} type="percent" />
        </div>
    );
}
