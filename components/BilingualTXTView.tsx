'use client';

import { useStore } from '@/store/useStore';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { translateText } from '@/services/translationService';
import { Loader2, Languages } from 'lucide-react';
import translations from '@/lib/translations';

const PARAGRAPHS_PER_PAGE = 60;
const CHUNK_SIZE = 4; // Translate N paragraphs in parallel per batch
const BATCH_DELAY_MS = 300; // Pause between batches to avoid rate-limit

type TransState = 'idle' | 'loading' | 'done' | 'error';

interface ParagraphState {
    original: string;
    translated: string;
    state: TransState;
}

async function translateBatch(
    texts: string[],
    targetLang: string,
): Promise<(string | null)[]> {
    return Promise.all(texts.map(t => translateText(t, targetLang).catch(() => null)));
}

export default function BilingualTXTView() {
    const {
        currentFile, currentPage, setCurrentPage,
        setTotalPages, zoomLevel, targetLanguage, uiLanguage,
    } = useStore();

    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [paragraphStates, setParagraphStates] = useState<ParagraphState[]>([]);
    const abortRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Load file ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!currentFile) return;
        setIsLoading(true);
        abortRef.current = true; // Cancel any in-flight translation

        const load = async () => {
            try {
                let text = '';
                if (currentFile instanceof File) {
                    text = await currentFile.text();
                } else {
                    const r = await fetch(currentFile);
                    text = await r.text();
                }
                setContent(text);
            } catch {
                setContent('Error al cargar el archivo.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [currentFile]);

    // ── Parse paragraphs ──────────────────────────────────────────────────────
    const allParagraphs = useMemo(
        () => content.split(/\n+/).filter(p => p.trim().length > 0),
        [content],
    );

    const totalPages = Math.max(1, Math.ceil(allParagraphs.length / PARAGRAPHS_PER_PAGE));

    useEffect(() => {
        if (!isLoading) setTotalPages(totalPages);
    }, [totalPages, setTotalPages, isLoading]);

    const visibleParagraphs = useMemo(
        () => allParagraphs.slice((currentPage - 1) * PARAGRAPHS_PER_PAGE, currentPage * PARAGRAPHS_PER_PAGE),
        [allParagraphs, currentPage],
    );

    // ── Translate visible paragraphs ──────────────────────────────────────────
    const translate = useCallback(async (paras: string[], lang: string) => {
        abortRef.current = false;

        // Initialize all as loading
        setParagraphStates(paras.map(p => ({ original: p, translated: '', state: 'loading' })));

        for (let i = 0; i < paras.length; i += CHUNK_SIZE) {
            if (abortRef.current) break;

            const chunk = paras.slice(i, i + CHUNK_SIZE);
            const results = await translateBatch(chunk, lang);

            if (abortRef.current) break;

            setParagraphStates(prev => {
                const next = [...prev];
                chunk.forEach((_, j) => {
                    const idx = i + j;
                    if (idx < next.length) {
                        next[idx] = {
                            original: paras[idx],
                            translated: results[j] ?? '',
                            state: results[j] ? 'done' : 'error',
                        };
                    }
                });
                return next;
            });

            if (i + CHUNK_SIZE < paras.length) {
                await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
            }
        }
    }, []);

    useEffect(() => {
        if (!isLoading && visibleParagraphs.length > 0) {
            translate(visibleParagraphs, targetLanguage);
        }
        return () => { abortRef.current = true; };
    }, [visibleParagraphs, targetLanguage, isLoading, translate]);

    const fontSize = `calc(1rem * ${zoomLevel} / 100)`;
    const isLargeFile = allParagraphs.length > PARAGRAPHS_PER_PAGE;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4" style={{ background: 'var(--bg-surface)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--teal)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.readingFile}</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-auto flex flex-col"
            style={{ background: 'var(--bg-surface)', WebkitOverflowScrolling: 'touch' }}
        >
            {/* Header */}
            <div
                className="flex items-center gap-2 px-6 py-3 sticky top-0 z-10"
                style={{
                    background: 'rgba(8,8,20,0.9)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Languages size={14} style={{ color: 'var(--accent-hover)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    Modo bilingüe — Original · Traducción
                </span>
                {paragraphStates.some(p => p.state === 'loading') && (
                    <Loader2 size={12} className="animate-spin ml-auto" style={{ color: 'var(--teal)' }} />
                )}
            </div>

            {/* Pagination */}
            {isLargeFile && (
                <div className="flex items-center justify-center gap-4 px-6 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <button
                        onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)); containerRef.current?.scrollTo(0, 0); }}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 text-xs font-bold rounded-lg disabled:opacity-30"
                        style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-hover)' }}
                    >
                        ← Anterior
                    </button>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => { setCurrentPage(Math.min(totalPages, currentPage + 1)); containerRef.current?.scrollTo(0, 0); }}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 text-xs font-bold rounded-lg disabled:opacity-30"
                        style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-hover)' }}
                    >
                        Siguiente →
                    </button>
                </div>
            )}

            {/* Bilingual paragraphs */}
            <div className="flex-1 px-4 py-6 pb-32 max-w-6xl mx-auto w-full">
                {paragraphStates.map((p, i) => (
                    <div
                        key={`${currentPage}-${i}`}
                        className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-5 rounded-2xl overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        {/* Original — left */}
                        <div
                            className="p-4 md:p-5 font-reading"
                            style={{
                                fontSize,
                                lineHeight: 1.85,
                                color: 'var(--text-secondary)',
                                background: 'rgba(255,255,255,0.02)',
                                borderRight: '1px solid rgba(255,255,255,0.04)',
                            }}
                        >
                            {p.original}
                        </div>

                        {/* Translation — right */}
                        <div
                            className="p-4 md:p-5 font-reading"
                            style={{
                                fontSize,
                                lineHeight: 1.85,
                                background: 'rgba(99,102,241,0.04)',
                            }}
                        >
                            {p.state === 'loading' ? (
                                <span
                                    className="inline-block animate-pulse rounded"
                                    style={{
                                        background: 'rgba(99,102,241,0.12)',
                                        height: '1em',
                                        width: `${60 + (i * 17) % 35}%`,
                                        display: 'block',
                                        marginTop: '0.2em',
                                    }}
                                />
                            ) : p.state === 'error' ? (
                                <span style={{ color: 'var(--text-disabled)', fontStyle: 'italic' }}>
                                    —
                                </span>
                            ) : (
                                <span style={{ color: 'var(--accent-hover)' }}>{p.translated}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
