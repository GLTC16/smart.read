"use client";

import { useStore } from "@/store/useStore";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const spinnerLoader = (color: string, bg: string, text: string) => (
    <div className="flex flex-col items-center justify-center gap-4 h-full" style={{ background: 'var(--bg-surface)', minHeight: '400px' }}>
        <div className="p-4 rounded-2xl" style={{ background: bg, border: `1px solid ${color}30` }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
);

const PDFViewer = dynamic(() => import("./PDFViewer"), {
    ssr: false,
    loading: () => spinnerLoader('var(--accent)', 'rgba(99,102,241,0.1)', 'Cargando PDF…'),
});

const EpubViewer = dynamic(() => import("./EpubViewer"), {
    ssr: false,
    loading: () => spinnerLoader('var(--teal)', 'rgba(20,184,166,0.1)', 'Cargando EPUB…'),
});

const TXTViewer = dynamic(() => import("./TXTViewer"), {
    ssr: false,
    loading: () => spinnerLoader('var(--accent)', 'rgba(99,102,241,0.1)', 'Cargando texto…'),
});

export default function BookViewer() {
    const { currentFile, fileType } = useStore();

    if (!currentFile) return null;

    return (
        <motion.div
            className="relative w-full h-full overflow-hidden rounded-xl"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
            }}
        >
            {fileType === 'pdf' && <PDFViewer />}
            {fileType === 'epub' && <EpubViewer />}
            {fileType === 'txt' && <TXTViewer />}
        </motion.div>
    );
}
