'use client';

import { useStore } from '@/store/useStore';
import { translateText } from '@/services/translationService';
import { useEffect, useRef, useState, useMemo } from 'react';
import { X, Copy, Globe, Loader2, Check, GripHorizontal, Star } from 'lucide-react';
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
        addToHistory,
        addHighlight,
        currentFile,
        fileType,
    } = useStore();

    const tooltipRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isDraggingState, setIsDraggingState] = useState(false);
    
    // Drag state
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);

    // Reset drag offset when selection changes
    useEffect(() => {
        setDragOffset({ x: 0, y: 0 });
        setIsDraggingState(false);
        isDragging.current = false;
    }, [selectionPosition]);

    // Reset saved state when selection changes
    useEffect(() => { setSaved(false); }, [selectedText]);

    // Fetch translation when text or language changes + auto-add to history
    useEffect(() => {
        if (!selectedText) return;

        let cancelled = false;
        const fetchTranslation = async () => {
            setIsTranslationLoading(true);
            setTranslationResult(null);
            try {
                const translatedText = await translateText(selectedText, targetLanguage);
                if (!cancelled) {
                    const result = translatedText || t.translationUnavailable;
                    setTranslationResult(result);
                    // Auto-add to history
                    if (translatedText && translatedText !== t.translationUnavailable) {
                        addToHistory({ originalText: selectedText, translatedText, targetLanguage });
                    }
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
    }, [selectedText, targetLanguage, setIsTranslationLoading, setTranslationResult, t, addToHistory]);

    // Tooltip auto-closes when selection collapses in the respective viewers (handled by the viewer components)

    const handleCopy = async () => {
        if (!translationResult) return;
        await navigator.clipboard.writeText(translationResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        if (!selectedText || !translationResult) return;
        const fileName = currentFile instanceof File
            ? currentFile.name.replace(/\.[^/.]+$/, '')
            : typeof currentFile === 'string'
                ? (currentFile.split('/').pop() || '').replace(/\.[^/.]+$/, '')
                : 'Desconocido';
        addHighlight({
            originalText: selectedText,
            translatedText: translationResult,
            targetLanguage,
            fileName,
            fileType,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        isDragging.current = true;
        setIsDraggingState(true);
        dragStart.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!isDragging.current) return;
        setDragOffset({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        isDragging.current = false;
        setIsDraggingState(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    if (!selectedText || !selectionPosition) return null;

    // Smart positioning: clamp horizontally and flip vertically if needed
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 800;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 600;
    const isMobile = viewportW < 640;

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

    // Mobile: bottom sheet anchored to bottom of viewport
    if (isMobile) {
        return (
            <div
                id="translation-tooltip"
                ref={tooltipRef}
                className="fixed z-[9999] flex flex-col overflow-hidden"
                style={{
                    left: 8,
                    right: 8,
                    bottom: 80, // above BottomBar
                    animation: 'tooltipIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                    background: 'rgba(10, 10, 24, 0.95)',
                    backdropFilter: 'blur(28px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '20px',
                    boxShadow: '0 -4px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-2 pb-1">
                    <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
                </div>
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div className="flex items-center gap-2">
                        <Globe size={13} style={{ color: 'var(--accent-hover)' }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                            {activeLang?.flag} {activeLang?.label ?? targetLanguage.toUpperCase()}
                        </span>
                    </div>
                    <button
                        onClick={resetSelection}
                        className="p-1.5 rounded-lg"
                        style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)' }}
                    >
                        <X size={14} />
                    </button>
                </div>
                {/* Body */}
                <div className="p-4 flex flex-col gap-3">
                    <div className="text-sm italic pl-3" style={{ color: 'var(--text-muted)', borderLeft: '2px solid rgba(99,102,241,0.4)' }}>
                        &ldquo;{selectedText}&rdquo;
                    </div>
                    <div className="min-h-8">
                        {isTranslationLoading ? (
                            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
                                <span className="text-sm">{t.translating}</span>
                            </div>
                        ) : (
                            <div className="text-base font-semibold leading-snug font-reading" style={{ color: 'var(--text-primary)' }}>
                                {translationResult}
                            </div>
                        )}
                    </div>
                    {/* Language row + copy */}
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex flex-wrap gap-1">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setTargetLanguage(lang.code)}
                                    className="text-[10px] font-bold px-2 py-1.5 rounded-lg min-w-[36px] transition-all"
                                    style={{
                                        background: targetLanguage === lang.code ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                                        color: targetLanguage === lang.code ? 'var(--accent-hover)' : 'var(--text-muted)',
                                        border: targetLanguage === lang.code ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                                    }}
                                >
                                    {lang.flag}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {translationResult && (
                                <button
                                    onClick={handleSave}
                                    className="p-2 rounded-xl transition-all"
                                    style={{
                                        color: saved ? '#fbbf24' : 'var(--text-muted)',
                                        background: saved ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)',
                                        border: saved ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
                                    }}
                                    title={saved ? '¡Guardado!' : 'Guardar'}
                                >
                                    <Star size={16} fill={saved ? '#fbbf24' : 'none'} />
                                </button>
                            )}
                            {translationResult && (
                                <button
                                    onClick={handleCopy}
                                    className="p-2 rounded-xl transition-all"
                                    style={{
                                        color: copied ? 'var(--teal-hover)' : 'var(--text-muted)',
                                        background: copied ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.06)',
                                        border: copied ? '1px solid rgba(20,184,166,0.3)' : '1px solid transparent',
                                    }}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            id="translation-tooltip"
            ref={tooltipRef}
            className={`fixed z-[9999] flex flex-col overflow-hidden ${isDraggingState ? 'shadow-[0_0_0_2px_rgba(99,102,241,0.5)]' : ''}`}
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
                    background: isDraggingState 
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(20,184,166,0.15) 100%)' 
                        : 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(20,184,166,0.08) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <div className="flex items-center gap-2 flex-1">
                    <button
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors cursor-grab active:cursor-grabbing touch-none ${isDraggingState ? 'bg-indigo-500 text-white shadow-md' : 'text-indigo-300'}`}
                        style={{
                            background: isDraggingState ? 'var(--accent)' : 'rgba(99,102,241,0.2)',
                            border: '1px solid',
                            borderColor: isDraggingState ? 'transparent' : 'rgba(99,102,241,0.3)',
                        }}
                    >
                        <GripHorizontal size={14} style={{ color: isDraggingState ? 'white' : 'var(--accent-hover)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDraggingState ? 'white' : 'var(--text-secondary)' }}>
                            Arrastrar
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

                    {/* Save + Copy buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {translationResult && (
                            <button
                                onClick={handleSave}
                                className="p-1.5 rounded-lg transition-all duration-150"
                                style={{
                                    color: saved ? '#fbbf24' : 'var(--text-muted)',
                                    background: saved ? 'rgba(251,191,36,0.15)' : 'transparent',
                                    border: saved ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
                                }}
                                title={saved ? '¡Guardado!' : 'Guardar en highlights'}
                            >
                                <Star size={14} fill={saved ? '#fbbf24' : 'none'} />
                            </button>
                        )}
                        {translationResult && (
                            <button
                                onClick={handleCopy}
                                className="p-1.5 rounded-lg transition-all duration-150"
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
        </div>
    );
}
