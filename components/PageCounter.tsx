'use client';

import { useStore } from '@/store/useStore';
import { useMemo, useState, useEffect } from 'react';
import translations from '@/lib/translations';

interface PageCounterProps {
    current: number;
    total: number;
    type?: 'page' | 'chapter' | 'percent';
}

export default function PageCounter({ current, total, type = 'page' }: PageCounterProps) {
    const { uiLanguage, setCurrentPage } = useStore();
    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);
    
    // Sync slider with current page, unless user is actively dragging it
    const [sliderValue, setSliderValue] = useState(current);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!isDragging) {
            setSliderValue(current);
        }
    }, [current, isDragging]);

    if (total <= 1) return null;

    const getDisplayText = (val: number) => {
        switch (type) {
            case 'percent':
                return `${Math.round(val)}%`;
            case 'chapter':
                return t.chapterOf
                    .replace('{current}', String(val))
                    .replace('{total}', String(total));
            case 'page':
            default:
                return t.pageOf
                    .replace('{current}', String(val))
                    .replace('{total}', String(total));
        }
    };

    return (
        <div
            className="fixed bottom-20 right-6 z-40 px-4 py-3 rounded-2xl shadow-2xl flex flex-col items-center gap-2"
            style={{
                background: 'rgba(15, 15, 30, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
                minWidth: '200px',
            }}
        >
            <span className="text-sm font-bold text-white tracking-wide">
                {getDisplayText(sliderValue)}
            </span>
            <input
                type="range"
                min={1}
                max={total}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
                onMouseUp={() => {
                    setIsDragging(false);
                    setCurrentPage(sliderValue);
                }}
                onTouchEnd={() => {
                    setIsDragging(false);
                    setCurrentPage(sliderValue);
                }}
                className="w-full accent-indigo-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
            />
        </div>
    );
}
