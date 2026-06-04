'use client';

import { useStore } from '@/store/useStore';
import { BookOpen, X, LogOut } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { toc, setCurrentPage, fileType, epubRendition, clearFile } = useStore();

    const handleNav = (item: import('@/store/useStore').TOCItem) => {
        if (fileType === 'epub') {
            epubRendition?.display(item.href);
        } else if (fileType === 'pdf' && item.page) {
            setCurrentPage(item.page);
        }
        onClose();
    };

    const handleCloseBook = () => {
        clearFile();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 transition-opacity duration-300"
                style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div
                className="fixed top-0 left-0 h-full z-50 flex flex-col"
                style={{
                    width: '288px',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'rgba(10, 10, 22, 0.9)',
                    backdropFilter: 'blur(32px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
                }}
            >
                {/* Gradient header */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(20,184,166,0.1) 100%)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <div
                            className="p-1.5 rounded-lg"
                            style={{
                                background: 'rgba(99,102,241,0.2)',
                                border: '1px solid rgba(99,102,241,0.3)',
                            }}
                        >
                            <BookOpen
                                size={18}
                                style={{ color: 'var(--accent-hover)' }}
                            />
                        </div>
                        <span
                            className="font-bold text-base"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Contenido
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-all duration-150"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* TOC List */}
                <div
                    className="flex-1 overflow-y-auto p-4 space-y-1"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}
                >
                    {toc.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center mt-12 gap-3"
                            style={{ color: 'var(--text-disabled)' }}
                        >
                            <BookOpen size={32} style={{ opacity: 0.4 }} />
                            <p className="text-sm text-center">
                                Sin tabla de contenidos disponible.
                            </p>
                        </div>
                    ) : (
                        toc.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => handleNav(item)}
                                className="w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-150 truncate group"
                                style={{
                                    color: 'var(--text-secondary)',
                                    fontWeight: 500,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                title={item.label}
                                onMouseEnter={e => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.background = 'rgba(99,102,241,0.12)';
                                    el.style.color = 'var(--accent-hover)';
                                    el.style.boxShadow = 'inset 3px 0 0 var(--accent)';
                                    el.style.paddingLeft = '20px';
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.background = 'transparent';
                                    el.style.color = 'var(--text-secondary)';
                                    el.style.boxShadow = 'none';
                                    el.style.paddingLeft = '16px';
                                }}
                            >
                                {item.label}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer: Close Book */}
                <div
                    className="p-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <button
                        onClick={handleCloseBook}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                        style={{
                            color: '#f87171',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.15)',
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = 'rgba(239,68,68,0.15)';
                            el.style.borderColor = 'rgba(239,68,68,0.3)';
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = 'rgba(239,68,68,0.08)';
                            el.style.borderColor = 'rgba(239,68,68,0.15)';
                        }}
                    >
                        <LogOut size={16} />
                        <span>Cerrar libro</span>
                    </button>
                    <p
                        className="text-center text-xs mt-3"
                        style={{ color: 'var(--text-disabled)' }}
                    >
                        SmartRead v2.0
                    </p>
                </div>
            </div>
        </>
    );
}
