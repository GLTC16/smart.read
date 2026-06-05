'use client';

import { useStore } from '@/store/useStore';
import { Star, Trash2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FLAG: Record<string, string> = {
    en: '🇬🇧', es: '🇪🇸', it: '🇮🇹', fr: '🇫🇷',
    de: '🇩🇪', pt: '🇵🇹', ja: '🇯🇵', zh: '🇨🇳',
};

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function HighlightsPanel() {
    const { highlights, removeHighlight } = useStore();

    if (highlights.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center mt-16 gap-3" style={{ color: 'var(--text-disabled)' }}>
                <Star size={28} style={{ opacity: 0.3 }} />
                <p className="text-sm text-center px-4">
                    Guarda traducciones importantes con ⭐ en el tooltip de traducción.
                </p>
            </div>
        );
    }

    // Group by fileName
    const grouped = highlights.reduce<Record<string, typeof highlights>>((acc, h) => {
        const key = h.fileName || 'Sin libro';
        if (!acc[key]) acc[key] = [];
        acc[key].push(h);
        return acc;
    }, {});

    return (
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
            <p className="text-[10px] pt-2 px-1" style={{ color: 'var(--text-disabled)' }}>
                {highlights.length} guardados
            </p>

            {Object.entries(grouped).map(([book, entries]) => (
                <div key={book}>
                    {/* Book header */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <BookOpen size={11} style={{ color: 'var(--accent-hover)', flexShrink: 0 }} />
                        <span className="text-[10px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>
                            {book}
                        </span>
                    </div>

                    <AnimatePresence initial={false}>
                        {entries.map((h) => (
                            <motion.div
                                key={h.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.18 }}
                                className="rounded-xl p-3 mb-2 group"
                                style={{
                                    background: 'rgba(99,102,241,0.06)',
                                    border: '1px solid rgba(99,102,241,0.12)',
                                }}
                            >
                                {/* Original */}
                                <p
                                    className="text-xs italic mb-1.5 pl-2 line-clamp-3"
                                    style={{
                                        color: 'var(--text-muted)',
                                        borderLeft: '2px solid rgba(99,102,241,0.4)',
                                    }}
                                >
                                    &ldquo;{h.originalText}&rdquo;
                                </p>

                                {/* Translation */}
                                {h.translatedText && (
                                    <p className="text-sm font-semibold line-clamp-3 mb-2" style={{ color: 'var(--text-primary)' }}>
                                        {h.translatedText}
                                    </p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">{FLAG[h.targetLanguage] ?? h.targetLanguage}</span>
                                        <span className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>
                                            {formatDate(h.timestamp)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeHighlight(h.id)}
                                        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
