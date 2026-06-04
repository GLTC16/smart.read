import { create } from 'zustand';
import type { UILanguage } from '@/lib/translations';

export type FileType = 'epub' | 'pdf' | 'txt';
export type Language = 'it' | 'es' | 'en' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';

export interface TOCItem {
    id: string;
    label: string;
    href?: string; // For EPUB
    page?: number; // For PDF
}

export interface Rendition {
    display: (target?: string) => void;
    prev: () => void;
    next: () => void;
    on: (event: string, listener: (...args: unknown[]) => void) => void;
    themes: {
        default: (styles: Record<string, unknown>) => void;
        fontSize: (size: string) => void;
        [key: string]: unknown;
    };
    manager?: unknown;
    getRange: (cfi: string) => unknown;
    [key: string]: unknown;
}

export interface SmartReadStore {
    // File State
    currentFile: File | string | null;
    fileType: FileType | null;
    setFile: (file: File | string, type: FileType) => void;
    clearFile: () => void;

    // Navigation State
    currentPage: number; // For PDF (page number)
    totalPages: number; // Total pages for PDF, chapters for EPUB, 0 for TXT
    currentLocation: string | number | null; // For EPUB (cfi)
    setCurrentPage: (page: number) => void;
    setTotalPages: (total: number) => void;
    setCurrentLocation: (loc: string | number) => void;

    toc: TOCItem[];
    setToc: (toc: TOCItem[]) => void;

    // Zoom State
    zoomLevel: number; // default 100 (percent)
    setZoomLevel: (level: number) => void;

    // Translation / Selection State
    selectedText: string | null;
    selectionPosition: { x: number; y: number } | null;
    targetLanguage: Language;
    isTranslationLoading: boolean;
    translationResult: string | null;

    setSelectedText: (text: string | null) => void;
    setSelectionPosition: (pos: { x: number; y: number } | null) => void;
    setTargetLanguage: (lang: Language) => void;
    setIsTranslationLoading: (loading: boolean) => void;
    setTranslationResult: (result: string | null) => void;
    resetSelection: () => void;

    // EPUB Rendition (Internal use for imperative control)
    epubRendition: Rendition | null;
    setEpubRendition: (rendition: Rendition | null) => void;

    // UI Language (i18n)
    uiLanguage: UILanguage;
    setUiLanguage: (lang: UILanguage) => void;
}

export const useStore = create<SmartReadStore>((set) => ({
    // File State
    currentFile: null,
    fileType: null,
    setFile: (file, type) => set({
        currentFile: file,
        fileType: type,
        currentPage: 1,
        totalPages: 0,
        currentLocation: null,
        toc: [],
        selectedText: null,
        selectionPosition: null,
        translationResult: null,
        zoomLevel: type === 'pdf' ? 60 : 100,
    }),
    clearFile: () => set({
        currentFile: null,
        fileType: null,
        toc: [],
        selectedText: null,
        selectionPosition: null,
        translationResult: null,
        zoomLevel: 100,
    }),

    // Navigation State
    currentPage: 1,
    totalPages: 0,
    currentLocation: null,
    setCurrentPage: (page) => set({ currentPage: page }),
    setTotalPages: (total) => set({ totalPages: total }),
    setCurrentLocation: (loc) => set({ currentLocation: loc }),

    toc: [],
    setToc: (toc) => set({ toc }),

    // Zoom State
    zoomLevel: 100,
    setZoomLevel: (level) => set({ zoomLevel: Math.min(200, Math.max(50, level)) }),

    // Translation / Selection State
    selectedText: null,
    selectionPosition: null,
    targetLanguage: 'en',
    isTranslationLoading: false,
    translationResult: null,

    setSelectedText: (text) => set({ selectedText: text }),
    setSelectionPosition: (pos) => set({ selectionPosition: pos }),
    setTargetLanguage: (lang) => set({ targetLanguage: lang }),
    setIsTranslationLoading: (loading) => set({ isTranslationLoading: loading }),
    setTranslationResult: (result) => set({ translationResult: result }),
    resetSelection: () => set({
        selectedText: null,
        selectionPosition: null,
        translationResult: null
    }),

    // EPUB Rendition (Internal use for imperative control)
    epubRendition: null,
    setEpubRendition: (rendition) => set({ epubRendition: rendition }),

    // UI Language — default 'en', will be overridden client-side by browser detection
    uiLanguage: 'en',
    setUiLanguage: (lang) => set({ uiLanguage: lang }),
}));