'use client';

import { useStore } from '@/store/useStore';
import dynamic from 'next/dynamic';
import EpubViewer from './EpubViewer';
import TXTViewer from './TXTViewer';

// Import PDFViewer dynamically to avoid SSR issues with DOMMatrix
const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false });

export default function BookViewer() {
    const { fileType } = useStore();

    if (!fileType) return null;

    switch (fileType) {
        case 'epub':
            return <EpubViewer />;
        case 'pdf':
            return <PDFViewer />;
        case 'txt':
            return <TXTViewer />;
        default:
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Unsupported file type</p>
                </div>
            );
    }
}