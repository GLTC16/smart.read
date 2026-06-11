"use client";

import { useStore } from "@/store/useStore";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import translations from "@/lib/translations";
import BilingualTXTView from "./BilingualTXTView";

function ViewerLoader({ color, bg, msgKey }: { color: string; bg: string; msgKey: 'loadingPdf' | 'loadingEpub' | 'loadingTxt' }) {
    const { uiLanguage } = useStore();
    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);
    return (
        <div className="flex flex-col items-center justify-center gap-4 h-full" style={{ background: 'var(--bg-surface)', minHeight: '400px' }}>
            <div className="p-4 rounded-2xl" style={{ background: bg, border: `1px solid ${color}30` }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t[msgKey]}</p>
        </div>
    );
}

const PDFViewer = dynamic(() => import("./PDFViewer"), {
    ssr: false,
    loading: () => <ViewerLoader color="var(--accent)" bg="rgba(99,102,241,0.1)" msgKey="loadingPdf" />,
});

const EpubViewer = dynamic(() => import("./EpubViewer"), {
    ssr: false,
    loading: () => <ViewerLoader color="var(--teal)" bg="rgba(20,184,166,0.1)" msgKey="loadingEpub" />,
});

const TXTViewer = dynamic(() => import("./TXTViewer"), {
    ssr: false,
    loading: () => <ViewerLoader color="var(--accent)" bg="rgba(99,102,241,0.1)" msgKey="loadingTxt" />,
});

export default function BookViewer() {
    const { currentFile, fileType, isBilingualMode } = useStore();

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
            {fileType === 'txt' && !isBilingualMode && <TXTViewer />}
            {fileType === 'txt' && isBilingualMode && <BilingualTXTView />}
        </motion.div>
    );
}
