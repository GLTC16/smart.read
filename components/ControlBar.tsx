'use client';

import { useStore } from '@/store/useStore';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ControlBar() {
    const {
        isPlaying, setIsPlaying,
        currentPage, setCurrentPage,
        fileType, currentFile,
        currentLocation // EPUB paging is harder without the reader ref, will handle via global event or store method? 
        // Ideally the Viewer updates the store, but ControlBar controlling Viewer needs a shared ref or store action.
        // For EPUB, 'prev/next' usually requires calling `rendition.prev()`.
        // We might need to expose a "nextPageTrigger" in store, or use a ref passed down?
        // Given the architecture, putting `nextPage` function in store might be complex with refs.
        // Alternative: The ControlBar sets a "command" in the store effectively, and Viewers listen to it.
        // For now, let's assume PDF uses currentPage. EPUB uses... `rendition`.
        // Let's use a Custom Event or specific store actions if we can. 
        // Simplified: We will focus on TTS controls first. Page nav might be inside the viewer for EPUB or we lift state.
    } = useStore();

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');

    useEffect(() => {
        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            setVoices(available);
            if (available.length > 0 && !selectedVoice) {
                setSelectedVoice(available[0].name); // Default to first or specific lang
            }
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [selectedVoice]);

    // We need to store the selected voice in the store so the TTS engine (Reader) can use it.
    // I should add `voice` to the store.

    if (!currentFile) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-lg z-50 flex items-center justify-between md:pl-72 transition-all duration-300">
            {/* Navigation Group (Mainly for PDF, EPUB has its own internal nav usually but we can try to unify) */}
            <div className="flex items-center gap-2">
                <button
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-600 disabled:opacity-50"
                    onClick={() => {
                        if (fileType === 'pdf') setCurrentPage(Math.max(1, currentPage - 1));
                        // EPUB prev logic needs to be handled via event or ref in page.tsx
                        if (fileType === 'epub') window.dispatchEvent(new CustomEvent('epub-prev'));
                    }}
                >
                    <ChevronLeft />
                </button>
                <span className="text-sm font-medium text-slate-600">
                    {fileType === 'pdf' ? `Page ${currentPage}` : 'Reading'}
                </span>
                <button
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
                    onClick={() => {
                        if (fileType === 'pdf') setCurrentPage(currentPage + 1);
                        if (fileType === 'epub') window.dispatchEvent(new CustomEvent('epub-next'));
                    }}
                >
                    <ChevronRight />
                </button>
            </div>

            {/* TTS Controls */}
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:text-slate-800">
                    <SkipBack size={20} />
                </button>

                <button
                    className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-transform hover:scale-105 active:scale-95"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? <Pause fill="white" /> : <Play fill="white" className="ml-1" />}
                </button>

                <button className="p-2 text-slate-500 hover:text-slate-800">
                    <SkipForward size={20} />
                </button>
            </div>

            {/* Settings / Voice */}
            <div className="flex items-center gap-2">
                <select
                    className="bg-slate-50 border border-slate-200 rounded-md text-sm p-2 max-w-[150px] truncate"
                    value={selectedVoice}
                    onChange={(e) => {
                        setSelectedVoice(e.target.value);
                        // We should update store here
                    }}
                >
                    {voices.map(v => (
                        <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                </select>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
}
