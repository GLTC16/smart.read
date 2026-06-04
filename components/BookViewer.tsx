"use client";

import { useStore } from "@/store/useStore";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import translations from "@/lib/translations";

// Dynamic imports — SSR disabled for browser-only viewers
const PDFViewer = dynamic(() => import("./PDFViewer"), {
    ssr: false,
    loading: () => (
        <div
            className="flex flex-col items-center justify-center gap-4 h-full"
            style={{ background: 'var(--bg-surface)', minHeight: '400px' }}
        >
            <div
                className="p-4 rounded-2xl"
                style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                }}
            >
                <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: 'var(--accent)' }}
                />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Loading…
            </p>
        </div>
    ),
});

const EpubViewer = dynamic(() => import("./EpubViewer"), {
    ssr: false,
    loading: () => (
        <div
            className="flex flex-col items-center justify-center gap-4 h-full"
            style={{ background: 'var(--bg-surface)', minHeight: '400px' }}
        >
            <div
                className="p-4 rounded-2xl"
                style={{
                    background: 'rgba(20,184,166,0.1)',
                    border: '1px solid rgba(20,184,166,0.2)',
                }}
            >
                <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: 'var(--teal)' }}
                />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Loading…
            </p>
        </div>
    ),
});

const TXTViewer = dynamic(() => import("./TXTViewer"), {
    ssr: false,
    loading: () => (
        <div
            className="flex items-center justify-center h-full"
            style={{ background: 'var(--bg-surface)' }}
        >
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
    ),
});

export default function BookViewer() {
    const { currentFile, fileType, uiLanguage } = useStore();
    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);

    if (!currentFile) return null;

    return (
        <div
            className="relative w-full h-full overflow-hidden rounded-xl"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
                animation: 'scaleIn 0.3s ease forwards',
            }}
        >
            {fileType === 'pdf' && <PDFViewer />}
            {fileType === 'epub' && <EpubViewer />}
            {fileType === 'txt' && <TXTViewer />}
            {/* t is available for any future localized overlays */}
            {t && null}
        </div>
    );
}