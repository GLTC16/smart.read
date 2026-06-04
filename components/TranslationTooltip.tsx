'use client';

import { useStore } from '@/store/useStore';
import { translateText } from '@/services/translationService';
import { useEffect, useRef, useState, useMemo } from 'react';
import { X, Copy, Globe, Loader2, Check, GripHorizontal } from 'lucide-react';
import translations from '@/lib/translations';

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

const TOOLTIP_WIDTH = 320;
const TOOLTIP_MARGIN = 12;

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
        uiLanguage,
    } = useStore();

    const tooltipRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    
    // Drag state
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);

    // Reset drag offset when selection changes
    useEffect(() => {
        setDragOffset({ x: 0, y: 0 });
    }, [selectionPosition]);

    // Fetch translation when text or language changes
    useEffect(() => {
        if (!selectedText) return;

        let cancelled = false;
        const fetchTranslation = async () => {
            setIsTranslationLoading(true);
            setTranslationResult(null);
            try {
                const translatedText = await translateText(selectedText, targetLanguage);
                if (!cancelled) {
                    setTranslationResult(translatedText || t.translationUnavailable);
                }
            } catch {
                if (!cancelled) {
                    setTranslationResult(t.translationError);
                }
            } finally {
                if (!cancelled) {
                    setIsTranslationLoading(false);
                }
            }
        };
        fetchTranslation();
        return () => { cancelled = true; };
    }, [selectedText, targetLanguage, setIsTranslationLoading, setTranslationResult, t]);

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

    const handlePointerDown = (e: React.PointerEvent) => {
        isDragging.current = true;
        dragStart.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
        if (tooltipRef.current) tooltipRef.current.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current) return;
        setDragOffset({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        isDragging.current = false;
        if (tooltipRef.current) tooltipRef.current.releasePointerCapture(e.pointerId);
    };

    if (!selectedText || !selectionPosition) return null;

    // Smart positioning: clamp horizontally and flip vertically if needed
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 800;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 600;

    const halfTooltip = TOOLTIP_WIDTH / 2;
    const clampedX = Math.max(
        halfTooltip + TOOLTIP_MARGIN,
        Math.min(selectionPosition.x, viewportW - halfTooltip - TOOLTIP_MARGIN)
    );

    // If selection is in the bottom third of the screen, place tooltip above
    const showAbove = selectionPosition.y > viewportH * 0.65;
    const topPosition = showAbove
        ? selectionPosition.y - 16  // above selection
        : selectionPosition.y + 16; // below selection

    const activeLang = LANGUAGES.find(l => l.code === targetLanguage);

    const finalX = clampedX + dragOffset.x;
    const finalY = topPosition + dragOffset.y;

    return (
        <div
            id="translation-tooltip"
            ref={tooltipRef}
            className="fixed z-[9999] flex flex-col overflow-hidden"
            style={{
                width: `${TOOLTIP_WIDTH}px`,
                left: finalX,
                top: finalY,
                transform: showAbove
                    ? 'translateX(-50%) translateY(-100%)'
                    : 'translateX(-50%)',
                animation: 'tooltipIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                background: 'rgba(12, 12, 28, 0.85)',
                backdropFilter: 'blur(24px) saturate(200%)',
                WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '16px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(20,184,166,0.08) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <div className="flex items-center gap-2 flex-1">
                    <button
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-grab active:cursor-grabbing"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        style={{
                            background: 'rgba(99,102,241,0.2)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            touchAction: 'none',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                        }}
                    >
                        <GripHorizontal size={14} style={{ color: 'var(--accent-hover)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                            Reacomodar
                        </span>
                    </button>
                    
                    <div className="flex items-center gap-1 ml-2 border-l border-[rgba(255,255,255,0.1)] pl-3">
                        <Globe size={13} style={{ color: 'var(--accent-hover)' }} />
                        <span
                            className="text-xs font-bold uppercase tracking-wider hidden sm:inline"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {activeLang?.label ?? targetLanguage.toUpperCase()}
                        </span>
                        {activeLang && (
                            <span className="text-sm">{activeLang.flag}</span>
                        )}
                    </div>
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
                    className="text-sm italic pl-3 overflow-y-auto"
                    style={{
                        color: 'var(--text-muted)',
                        borderLeft: '2px solid rgba(99,102,241,0.4)',
                        maxHeight: '80px',
                    }}
                >
                    &ldquo;{selectedText}&rdquo;
                </div>

                {/* Translation result */}
                <div className="min-h-10 overflow-y-auto" style={{ maxHeight: '160px' }}>
                    {isTranslationLoading ? (
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
                            <span className="text-sm">{t.translating}</span>
                        </div>
                    ) : (
                        <div
                            className="text-base font-semibold leading-snug font-reading"
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
                            title={t.copyTranslation}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
