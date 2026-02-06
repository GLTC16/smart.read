import { create } from 'zustand';

export type FileType = 'epub' | 'pdf' | 'txt';
export type Language = 'it' | 'es' | 'en' | 'fr' | 'de';

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
        translationResult: null
    }),
    clearFile: () => set({
        currentFile: null,
        fileType: null,
        toc: [],
        selectedText: null,
        selectionPosition: null,
        translationResult: null
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

    // Translation / Selection State
    selectedText: null,
    selectionPosition: null,
    targetLanguage: 'es',
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
}));