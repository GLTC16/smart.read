"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import Sidebar from "@/components/Sidebar";
import BookViewer from "@/components/BookViewer";
import BottomBar from "@/components/BottomBar";
import TranslationTooltip from "@/components/TranslationTooltip";
import { Upload } from "lucide-react";

export default function Home() {
  const { currentFile, setFile } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      let type: 'pdf' | 'epub' | 'txt';

      if (fileName.endsWith('.pdf')) {
        type = 'pdf';
      } else if (fileName.endsWith('.txt')) {
        type = 'txt';
      } else {
        type = 'epub';
      }

      setFile(file, type);
    }
  };

  return (
    <main className="flex h-screen bg-gray-50 overflow-hidden">
      <TranslationTooltip />

      {/* Sidebar (TOC) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full relative transition-all duration-300">

        {/* If no file, show upload button */}
        {!currentFile ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
                SmartRead
              </h1>
              <p className="text-gray-500 max-w-md mx-auto">
                Your intelligent reader. Upload a PDF, EPUB or TXT to start.
              </p>

              <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
                <Upload className="w-5 h-5" />
                <span>Select Book</span>
                <input
                  type="file"
                  accept=".pdf,.epub,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        ) : (
          /* If file exists, show Viewer */
          <div className="flex-1 overflow-hidden p-0 pb-20 md:pb-0">
            {/* Padding bottom needed if BottomBar overlaps, but BottomBar is fixed. 
                Wait, BottomBar is fixed, so we might need padding. 
                Step 50 had pb-24. I will keep it.
             */}
            <div className="h-full pb-24 md:pb-24">
              <BookViewer />
            </div>
          </div>
        )}

        {/* Floating Controls */}
        {currentFile && (
          <BottomBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        )}
      </div>
    </main>
  );
}