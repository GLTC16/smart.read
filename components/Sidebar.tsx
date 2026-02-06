'use client';

import { useStore } from '@/store/useStore';
import { BookOpen, X } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { toc, setCurrentPage, fileType, epubRendition } = useStore();

    const handleNav = (item: import('@/store/useStore').TOCItem) => {
        if (fileType === 'epub') {
            epubRendition?.display(item.href);
            // setCurrentLocation(item.href); // usually handled by rendition callback
        } else if (fileType === 'pdf' && item.page) {
            setCurrentPage(item.page);
        }
        onClose(); // Auto close on mobile/tablet if needed, or keeping it strictly open requested?
        // Let's assume on mobile it might overlay, but on desktop it pushes content.
        // For now, this is a drawer-style sidebar.
    };

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div
                className={`
                    fixed top-0 left-0 h-full bg-white border-r border-slate-200 w-72 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                        <BookOpen className="text-blue-600" size={24} />
                        <span>Contents</span>
                    </div>
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {toc.length === 0 ? (
                        <div className="text-center text-slate-400 mt-10 text-sm">
                            No Table of Contents available.
                        </div>
                    ) : (
                        toc.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => handleNav(item)}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors truncate"
                                title={item.label}
                            >
                                {item.label}
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <p className="text-xs text-center text-slate-400 font-medium">
                        SmartRead v2.0
                    </p>
                </div>
            </div>
        </>
    );
}
