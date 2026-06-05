'use client';

import { useStore } from '@/store/useStore';
import { BookOpen, X, LogOut, UserCircle, Star, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import translations from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';
import HistoryPanel from './HistoryPanel';
import HighlightsPanel from './HighlightsPanel';

type Tab = 'toc' | 'highlights' | 'history';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { toc, setCurrentPage, fileType, epubRendition, clearFile, uiLanguage } = useStore();
    const t = useMemo(() => translations[uiLanguage], [uiLanguage]);
    const [activeTab, setActiveTab] = useState<Tab>('toc');

    const handleNav = (item: import('@/store/useStore').TOCItem) => {
        if (fileType === 'epub') {
            epubRendition?.display(item.href);
        } else if (fileType === 'pdf' && item.page) {
            setCurrentPage(item.page);
        }
        onClose();
    };

    const tabs: { id: Tab; icon: typeof BookOpen; label: string }[] = [
        { id: 'toc', icon: BookOpen, label: t.contents },
        { id: 'highlights', icon: Star, label: 'Guardados' },
        { id: 'history', icon: Clock, label: 'Historial' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose}
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        className="fixed top-0 left-0 h-full z-50 flex flex-col"
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
                        style={{
                            width: '288px',
                            background: 'rgba(10,10,22,0.93)',
                            backdropFilter: 'blur(32px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                            borderRight: '1px solid rgba(255,255,255,0.07)',
                            boxShadow: '8px 0 48px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-5 py-4"
                            style={{
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(20,184,166,0.08) 100%)',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>SmartRead</span>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-lg cursor-pointer"
                                style={{ color: 'var(--text-muted)' }}
                                aria-label="Cerrar menú"
                            >
                                <X size={16} />
                            </motion.button>
                        </div>

                        {/* Tabs */}
                        <div
                            className="flex gap-0 px-3 py-2"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            {tabs.map(({ id, icon: Icon, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all"
                                    style={{
                                        color: activeTab === id ? 'var(--accent-hover)' : 'var(--text-muted)',
                                        background: activeTab === id ? 'rgba(99,102,241,0.14)' : 'transparent',
                                        border: activeTab === id ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                                    }}
                                >
                                    <Icon size={14} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            <AnimatePresence mode="wait">
                                {activeTab === 'toc' && (
                                    <motion.div
                                        key="toc"
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 8 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex-1 overflow-y-auto p-3 space-y-0.5"
                                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.25) transparent' }}
                                    >
                                        {toc.length === 0 ? (
                                            <div
                                                className="flex flex-col items-center justify-center mt-16 gap-3"
                                                style={{ color: 'var(--text-disabled)' }}
                                            >
                                                <BookOpen size={28} style={{ opacity: 0.3 }} />
                                                <p className="text-sm text-center">{t.noTocAvailable}</p>
                                            </div>
                                        ) : (
                                            toc.map((item, i) => (
                                                <motion.button
                                                    key={i}
                                                    onClick={() => handleNav(item)}
                                                    initial={{ opacity: 0, x: -12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.03, duration: 0.18 }}
                                                    whileHover={{ backgroundColor: 'rgba(99,102,241,0.1)', x: 4, color: 'var(--accent-hover)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full text-left px-4 py-2.5 text-sm rounded-xl truncate font-medium cursor-pointer"
                                                    style={{ color: 'var(--text-secondary)', borderLeft: '2px solid transparent' }}
                                                    title={item.label}
                                                >
                                                    {item.label}
                                                </motion.button>
                                            ))
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'highlights' && (
                                    <motion.div
                                        key="highlights"
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 8 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex-1 overflow-hidden flex flex-col"
                                    >
                                        <HighlightsPanel />
                                    </motion.div>
                                )}

                                {activeTab === 'history' && (
                                    <motion.div
                                        key="history"
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 8 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex-1 overflow-hidden flex flex-col"
                                    >
                                        <HistoryPanel />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <motion.button
                                onClick={() => { clearFile(); onClose(); }}
                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(239,68,68,0.14)' }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                                style={{
                                    color: '#f87171',
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.15)',
                                }}
                            >
                                <LogOut size={15} />
                                <span>{t.closeBook}</span>
                            </motion.button>

                            <Link
                                href="/profile"
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                                style={{
                                    color: '#a5b4fc',
                                    background: 'rgba(99,102,241,0.08)',
                                    border: '1px solid rgba(99,102,241,0.15)',
                                }}
                            >
                                <UserCircle size={15} />
                                <span>Mi Perfil / Login</span>
                            </Link>

                            <p className="text-center text-xs pt-1" style={{ color: 'var(--text-disabled)' }}>SmartRead v2.0</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
