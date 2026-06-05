'use client';

import { useStore } from '@/store/useStore';
import { Clock, Trash2, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FLAG: Record<string, string> = {
    en: '🇬🇧', es: '🇪🇸', it: '🇮🇹', fr: '🇫🇷',
    de: '🇩🇪', pt: '🇵🇹', ja: '🇯🇵', zh: '🇨🇳',
};

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'ahora';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
    return `${Math.floor(diff / 86_400_000)}d`;
}

export default function HistoryPanel() {
    const { translationHistory, clearHistory } = useStore();
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return translationHistory;
        const q = query.toLowerCase();
        return translationHistory.filter(
            e => e.originalText.toLowerCase().includes(q) || e.translatedText.toLowerCase().includes(q)
        );
    }, [translationHistory, query]);

    if (translationHistory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center mt-16 gap-3" style={{ color: 'var(--text-disabled)' }}>
                <Clock size={28} style={{ opacity: 0.3 }} />
                <p className="text-sm text-center px-4">Las traducciones aparecerán aquí automáticamente.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search + clear */}
            <div className="px-3 py-2 space-y-2">
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                    <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar…"
                        className="flex-1 bg-transparent text-xs outline-none"
                        style={{ color: 'var(--text-primary)' }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
                            <X size={12} />
                        </button>
                    )}
                </div>
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>
                        {filtered.length} entradas
                    </span>
                    <button
                        onClick={clearHistory}
                        className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors hover:text-red-400"
                        style={{ color: 'var(--text-muted)', background: 'rgba(239,68,68,0.06)' }}
                    >
                        <Trash2 size={10} /> Limpiar
                    </button>
                </div>
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
                <AnimatePresence initial={false}>
                    {filtered.map((entry, i) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ delay: i < 20 ? i * 0.015 : 0, duration: 0.15 }}
                            className="rounded-xl p-3"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            {/* Original */}
                            <p className="text-xs italic mb-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                &ldquo;{entry.originalText}&rdquo;
                            </p>
                            {/* Translation */}
                            <p className="text-sm font-semibold line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                {entry.translatedText}
                            </p>
                            {/* Meta */}
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs">{FLAG[entry.targetLanguage] ?? entry.targetLanguage}</span>
                                <span className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>
                                    {timeAgo(entry.timestamp)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
