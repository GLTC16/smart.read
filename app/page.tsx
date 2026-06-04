'use client';

import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/Sidebar';
import { ControlBar } from '@/components/ControlBar';
import { TextSelectionTooltip } from '@/components/TextSelectionTooltip';
import { Upload } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic Import for Viewers (SSR false critical for both)
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });
const EpubViewer = dynamic(() => import('@/components/EpubViewer'), { ssr: false });

export default function Home() {
  const { currentFile, fileType, setFile } = useStore();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.name.endsWith('.pdf') ? 'pdf' : 'epub'; // Simple check
      // For real app check MIME type
      setFile(file, type);
    }
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-white text-slate-800 font-sans">
      <TextSelectionTooltip />

      {currentFile && <Sidebar />}

      <div className="flex-1 flex flex-col h-full relative">
        {!currentFile ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-slate-50 p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Upload size={40} />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-slate-900">Welcome to SmartRead</h1>
              <p className="text-slate-500 mb-8">
                Upload an EPUB or PDF file to start reading with advanced AI features.
              </p>

              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all hover:shadow-lg inline-block active:scale-95">
                <span>Select Book</span>
                <input type="file" className="hidden" accept=".epub,.pdf" onChange={handleUpload} />
              </label>

              <p className="mt-6 text-xs text-slate-400">
                Supports .epub and .pdf
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative overflow-hidden">
            {fileType === 'pdf' && <PDFViewer />}
            {fileType === 'epub' && <EpubViewer />}
          </div>
        )}

        {currentFile && <ControlBar />}
      </div>
    </main>
  );
}
