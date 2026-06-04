'use client';

import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import translations from '@/lib/translations';

interface PageCounterProps {
    current: number;
    total: number;
    type?: 'page' | 'chapter' | 'percent';
}

export default function PageCounter({ current, total, type = 'page' }: PageCounterProps) {
    const { uiLanguage } = useStore();
    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);

    if (total === 0) return null;

    const getDisplayText = () => {
        switch (type) {
            case 'percent':
                return `${Math.round(current)}%`;
            case 'chapter':
                return t.chapterOf
                    .replace('{current}', String(current))
                    .replace('{total}', String(total));
            case 'page':
            default:
                return t.pageOf
                    .replace('{current}', String(current))
                    .replace('{total}', String(total));
        }
    };

    return (
        <div
            className="fixed bottom-20 right-6 z-40 px-4 py-2 rounded-lg shadow-lg"
            style={{
                background: 'rgba(10, 10, 25, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {getDisplayText()}
            </span>
        </div>
    );
}
