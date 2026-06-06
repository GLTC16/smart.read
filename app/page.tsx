// SmartRead — redesigned v3 with i18n
"use client";

import { useStore } from "@/store/useStore";
import Sidebar from "@/components/Sidebar";
import BottomBar from "@/components/BottomBar";
import TranslationTooltip from "@/components/TranslationTooltip";
import translations, { detectBrowserLanguage } from "@/lib/translations";
import { Upload, BookOpen, Zap, Globe, Shield, Loader2 } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

const BookViewer = dynamic(() => import("@/components/BookViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a19] text-white">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-400">Iniciando motor de lectura...</p>
    </div>
  ),
});

export default function Home() {
  const { currentFile, setFile, uiLanguage, setUiLanguage, setTargetLanguage } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const t = useMemo(() => translations[uiLanguage], [uiLanguage]);

  // Detect browser language on mount
  useEffect(() => {
    const detected = detectBrowserLanguage();
    setUiLanguage(detected);
    setTargetLanguage(detected);
  }, [setUiLanguage, setTargetLanguage]);

  const processFile = useCallback(
    (file: File) => {
      const name = file.name.toLowerCase();
      let type: "pdf" | "epub" | "txt";
      if (name.endsWith(".pdf")) type = "pdf";
      else if (name.endsWith(".txt")) type = "txt";
      else type = "epub";
      setFile(file, type);
    },
    [setFile]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: t.featureNoInstall,
      desc: t.featureNoInstallDesc,
      accent: "var(--accent)",
      bg: "rgba(99,102,241,0.08)",
      border: "rgba(99,102,241,0.18)",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: t.featureTranslate,
      desc: t.featureTranslateDesc,
      accent: "var(--teal)",
      bg: "rgba(20,184,166,0.08)",
      border: "rgba(20,184,166,0.18)",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: t.featurePrivate,
      desc: t.featurePrivateDesc,
      accent: "#c4b5fd",
      bg: "rgba(139,92,246,0.08)",
      border: "rgba(139,92,246,0.18)",
    },
  ];

  const badges = [
    { label: "PDF", color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
    { label: "EPUB", color: "#818cf8", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)" },
    { label: "TXT", color: "#2dd4bf", bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.25)" },
    { label: t.badgeAITranslation, color: "#c4b5fd", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
  ];

  return (
    <main
      className="flex overflow-hidden"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-ui)", height: '100dvh' }}
    >
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <TranslationTooltip />

      <div className="flex-1 flex flex-col h-full relative">
        {!currentFile ? (
          /* ── LANDING ──────────────────────────────────────────────── */
          <div
            className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden pt-16 pb-8"
            style={{ background: "var(--gradient-hero)" }}
          >
            {/* Ambient orbs */}
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                top: "-15%", left: "-10%",
                width: "700px", height: "700px",
                background: "radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(60px)",
                animation: "float 9s ease-in-out infinite",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                bottom: "-10%", right: "-8%",
                width: "600px", height: "600px",
                background: "radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(60px)",
                animation: "float 11s ease-in-out infinite reverse",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                top: "30%", right: "15%",
                width: "350px", height: "350px",
                background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(40px)",
                animation: "float 7s ease-in-out infinite",
                animationDelay: "-4s",
              }}
            />

            {/* ── Hero content ──────────────────────── */}
            <div
              className="relative z-10 w-full max-w-2xl mx-auto px-6 flex flex-col items-center"
              style={{ animation: "slideUp 0.55s ease forwards" }}
            >
              {/* Logo */}
              <div
                className="p-4 rounded-3xl mb-6"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.28)",
                  boxShadow: "0 0 48px rgba(99,102,241,0.22), 0 0 96px rgba(99,102,241,0.08)",
                }}
              >
                <img src="/icon.png" alt="Smart Read Logo" className="w-14 h-14 object-contain rounded-xl" />
              </div>

              {/* Title */}
              <h1
                className="text-6xl sm:text-7xl font-black tracking-tight mb-3 text-center"
                style={{
                  background: "linear-gradient(135deg, #f1f0ff 0%, #a5b4fc 45%, #2dd4bf 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.08,
                }}
              >
                {t.heroTitle}
              </h1>

              {/* Tagline */}
              <p
                className="text-xl sm:text-2xl font-semibold mb-2 text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.tagline1}{" "}
                <span style={{ color: "var(--teal-hover)" }}>{t.tagline2}</span>
              </p>
              <p
                className="text-sm text-center mb-8 max-w-md leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {t.heroSubtitle}
              </p>

              {/* Format badges */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {badges.map((b) => (
                  <span
                    key={b.label}
                    className="text-xs font-bold px-4 py-1.5 rounded-full"
                    style={{
                      background: b.bg,
                      border: `1px solid ${b.border}`,
                      color: b.color,
                    }}
                  >
                    {b.label} ✓
                  </span>
                ))}
              </div>

              {/* ── Drop zone ──────────────────────────── */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative w-full rounded-3xl transition-all duration-300"
                style={{
                  padding: "2rem 1.5rem",
                  background: isDragOver
                    ? "rgba(99,102,241,0.14)"
                    : "rgba(15,15,30,0.55)",
                  border: `2px dashed ${isDragOver ? "var(--accent)" : "rgba(99,102,241,0.22)"}`,
                  backdropFilter: "blur(20px)",
                  boxShadow: isDragOver
                    ? "0 0 0 4px rgba(99,102,241,0.18), inset 0 0 40px rgba(99,102,241,0.07)"
                    : "0 4px 48px rgba(0,0,0,0.35)",
                }}
              >
                <label className="flex flex-col items-center gap-4 cursor-pointer">
                  {/* Upload icon */}
                  <div
                    style={{
                      transform: isDragOver ? "scale(1.18) translateY(-4px)" : "scale(1)",
                      transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: isDragOver
                          ? "rgba(99,102,241,0.28)"
                          : "rgba(99,102,241,0.1)",
                        border: `1px solid ${isDragOver ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.2)"}`,
                        boxShadow: isDragOver ? "0 0 32px rgba(99,102,241,0.45)" : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Upload
                        className="w-9 h-9"
                        style={{
                          color: isDragOver ? "#a5b4fc" : "var(--accent)",
                          transition: "color 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="text-center">
                    <p
                      className="text-lg font-bold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {isDragOver ? t.dragTitleActive : t.dragTitle}
                    </p>
                    {/* Desktop subtitle */}
                    <p className="hidden sm:block text-sm" style={{ color: "var(--text-muted)" }}>
                      {t.dragSubtitle}{" "}
                      <span
                        className="font-semibold underline underline-offset-2"
                        style={{ color: "var(--accent-hover)" }}
                      >
                        {t.clickToSelect}
                      </span>
                    </p>
                  </div>

                  {/* Mobile CTA button */}
                  <div
                    className="sm:hidden w-full text-center font-bold text-sm py-3 px-6 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff",
                      boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
                    }}
                  >
                    <BookOpen className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                    {t.clickToSelect}
                  </div>

                  {/* Format pills */}
                  <div className="flex gap-2 flex-wrap justify-center">
                    {[
                      { ext: "PDF", icon: "📄", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
                      { ext: "EPUB", icon: "📚", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.2)" },
                      { ext: "TXT", icon: "📝", bg: "rgba(20,184,166,0.1)", border: "rgba(20,184,166,0.2)" },
                    ].map((ft) => (
                      <div
                        key={ft.ext}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{
                          background: ft.bg,
                          border: `1px solid ${ft.border}`,
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span>{ft.icon}</span>
                        <span>{ft.ext}</span>
                      </div>
                    ))}
                  </div>

                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.epub,.txt,application/pdf,application/epub+zip,text/plain"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            {/* ── Feature cards ──────────────────────────── */}
            <div
              className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 px-6 w-full max-w-2xl mx-auto"
              style={{ animation: "slideUp 0.65s ease 0.12s both" }}
            >
              {features.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl p-5 interactive-scale"
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: card.bg, color: card.accent, border: `1px solid ${card.border}` }}
                  >
                    {card.icon}
                  </div>
                  <h3
                    className="font-bold text-sm mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer note + legal links */}
            <div className="relative z-10 mt-6 pb-6 text-center space-y-2">
              <p className="text-xs" style={{ color: "var(--text-disabled)" }}>
                {t.footerNote}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                {[
                  { href: '/about', label: 'Sobre Nosotros' },
                  { href: '/privacy', label: 'Privacidad' },
                  { href: '/terms', label: 'Términos' },
                  { href: '/contact', label: 'Contacto' },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="text-xs transition-colors hover:underline"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── READER VIEW ─────────────────────────────────── */
          <div className="flex-1 overflow-hidden relative" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', marginBottom: '72px' }}>
            <BookViewer />
          </div>
        )}

        <BottomBar toggleSidebar={() => setIsSidebarOpen(true)} />
      </div>
    </main>
  );
}