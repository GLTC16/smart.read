'use client';

import { useStore } from '@/store/useStore';
import { translateText } from '@/services/translationService';
import { useEffect, useRef } from 'react';
import { X, Copy, Globe, Loader2 } from 'lucide-react';

export default function TranslationTooltip() {
    const {
        selectedText,
        selectionPosition,
        targetLanguage,
        translationResult,
        setTranslationResult,
        isTranslationLoading,
        setIsTranslationLoading,
        setTargetLanguage,
        resetSelection
    } = useStore();

    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTranslation = async () => {
            if (!selectedText) return;

            setIsTranslationLoading(true);
            setTranslationResult(null);

            try {
                const translatedText = await translateText(selectedText, targetLanguage);
                setTranslationResult(translatedText);
            } catch (error) {
                console.error("Translation failed", error);
                setTranslationResult("Error translating text.");
            } finally {
                setIsTranslationLoading(false);
            }
        };

        fetchTranslation();

    }, [selectedText, targetLanguage, setIsTranslationLoading, setTranslationResult]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                resetSelection();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [resetSelection]);

    if (!selectedText || !selectionPosition) return null;

    return (
        <div
            ref={tooltipRef}
            className="fixed z-[100] w-72 bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: selectionPosition.x,
                top: selectionPosition.y + 20, // Offset below cursor
                transform: 'translateX(-50%)'
            }}
        >
            {/* Header */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <Globe size={12} />
                    <span>Auto &rarr; {targetLanguage.toUpperCase()}</span>
                </div>
                <button
                    onClick={resetSelection}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3">

                {/* Original */}
                <div className="text-slate-500 text-sm line-clamp-3 italic border-l-2 border-slate-200 pl-3">
                    &quot;{selectedText}&quot;
                </div>

                {/* Translation */}
                <div className="min-h-12">
                    {isTranslationLoading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Translating...</span>
                        </div>
                    ) : (
                        <div className="text-slate-800 font-medium text-lg leading-snug">
                            {translationResult}
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                    <div className="flex gap-1">
                        {(['en', 'es', 'it', 'fr', 'de'] as const).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setTargetLanguage(lang)}
                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md transition-all ${targetLanguage === lang
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-slate-400 hover:bg-slate-100'
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    {translationResult && (
                        <button
                            onClick={() => navigator.clipboard.writeText(translationResult)}
                            className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                            title="Copy Translation"
                        >
                            <Copy size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
