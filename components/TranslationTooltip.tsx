'use client';

import { useStore } from '@/store/useStore';
import { translateText } from '@/services/translationService';
import { useEffect, useRef } from 'react';
import { X, Copy, Globe, Loader2, Check } from 'lucide-react';
import { useState } from 'react';

const LANGUAGES: { code: import('@/store/useStore').Language; label: string; flag: string }[] = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'it', label: 'IT', flag: '🇮🇹' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'de', label: 'DE', flag: '🇩🇪' },
    { code: 'pt', label: 'PT', flag: '🇵🇹' },
    { code: 'ja', label: 'JA', flag: '🇯🇵' },
    { code: 'zh', label: 'ZH', flag: '🇨🇳' },
];

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
        resetSelection,
    } = useStore();

    const tooltipRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    // Fetch translation when text or language changes
    useEffect(() => {
        const fetchTranslation = async () => {
            if (!selectedText) return;
            setIsTranslationLoading(true);
            setTranslationResult(null);
            try {
                const translatedText = await translateText(selectedText, targetLanguage);
                setTranslationResult(translatedText);
            } catch (error) {
                console.error('Translation failed', error);
                setTranslationResult('Error al traducir el texto.');
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

    const handleCopy = async () => {
        if (!translationResult) return;
        await navigator.clipboard.writeText(translationResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!selectedText || !selectionPosition) return null;

    const activeLang = LANGUAGES.find(l => l.code === targetLanguage);

    return (
        <div
            ref={tooltipRef}
            className="fixed z-[9999] w-80 flex flex-col overflow-hidden"
            style={{
                left: selectionPosition.x,
                top: selectionPosition.y + 16,
                transform: 'translateX(-50%)',
                animation: 'tooltipIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                background: 'rgba(12, 12, 28, 0.92)',
                backdropFilter: 'blur(32px) saturate(200%)',
                WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '16px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(20,184,166,0.1) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <div className="flex items-center gap-2">
                    <Globe size={13} style={{ color: 'var(--accent-hover)' }} />
                    <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Auto → {activeLang?.label ?? targetLanguage.toUpperCase()}
                    </span>
                    {activeLang && (
                        <span className="text-sm">{activeLang.flag}</span>
                    )}
                </div>
                <button
                    onClick={resetSelection}
                    className="p-1 rounded-lg transition-all duration-150"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    }}
                >
                    <X size={14} />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3">
                {/* Original text */}
                <div
                    className="text-sm italic line-clamp-2 pl-3"
                    style={{
                        color: 'var(--text-muted)',
                        borderLeft: '2px solid rgba(99,102,241,0.4)',
                    }}
                >
                    &ldquo;{selectedText}&rdquo;
                </div>

                {/* Translation result */}
                <div className="min-h-10">
                    {isTranslationLoading ? (
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
                            <span className="text-sm">Traduciendo…</span>
                        </div>
                    ) : (
                        <div
                            className="text-lg font-semibold leading-snug font-reading"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {translationResult}
                        </div>
                    )}
                </div>

                {/* Language selector + copy */}
                <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                    {/* Language pills */}
                    <div className="flex flex-wrap gap-1">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setTargetLanguage(lang.code)}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all duration-150"
                                style={{
                                    background: targetLanguage === lang.code
                                        ? 'rgba(99,102,241,0.25)'
                                        : 'transparent',
                                    color: targetLanguage === lang.code
                                        ? 'var(--accent-hover)'
                                        : 'var(--text-muted)',
                                    border: targetLanguage === lang.code
                                        ? '1px solid rgba(99,102,241,0.4)'
                                        : '1px solid transparent',
                                }}
                                title={lang.label}
                            >
                                {lang.flag} {lang.label}
                            </button>
                        ))}
                    </div>

                    {/* Copy button */}
                    {translationResult && (
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-lg transition-all duration-150 flex-shrink-0 ml-2"
                            style={{
                                color: copied ? 'var(--teal-hover)' : 'var(--text-muted)',
                                background: copied ? 'rgba(20,184,166,0.15)' : 'transparent',
                                border: copied ? '1px solid rgba(20,184,166,0.3)' : '1px solid transparent',
                            }}
                            title="Copiar traducción"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
