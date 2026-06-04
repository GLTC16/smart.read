'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { listCloudFiles, deleteCloudFile } from '@/app/actions/cloud';
import { Cloud, Upload, Trash2, BookOpen, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function CloudLibraryPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();
  const router = useRouter();
  const { setFile } = useStore();

  useEffect(() => {
    fetchUserAndFiles();
  }, []);

  const fetchUserAndFiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);

    const res = await listCloudFiles();
    if (res.success) {
      // Supabase list() might return a dummy placeholder file `.emptyFolderPlaceholder`. Filter it out.
      setFiles(res.files?.filter(f => f.name !== '.emptyFolderPlaceholder') || []);
    } else {
      setError(res.error || 'Error cargando archivos');
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (files.length >= 5) {
      setError('Has alcanzado el límite máximo de 5 archivos. Elimina uno para subir más.');
      return;
    }

    // Only allow pdf, epub, txt
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'epub', 'txt'].includes(ext || '')) {
      setError('Formato no soportado. Usa PDF, EPUB o TXT.');
      return;
    }

    setUploading(true);
    setError(null);

    const { error: uploadError } = await supabase.storage
      .from('books')
      .upload(`${user.id}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      setError(uploadError.message);
    } else {
      await fetchUserAndFiles();
    }
    
    setUploading(false);
    // clear input
    e.target.value = '';
  };

  const handleDelete = async (fileName: string) => {
    setLoading(true);
    const res = await deleteCloudFile(fileName);
    if (res.success) {
      await fetchUserAndFiles();
    } else {
      setError(res.error || 'Error al eliminar');
      setLoading(false);
    }
  };

  const handleOpenBook = async (fileName: string) => {
    setLoading(true);
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('books')
        .download(`${user.id}/${fileName}`);
      
      if (downloadError) throw downloadError;

      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      let type: 'pdf' | 'epub' | 'txt' = 'epub';
      if (ext === 'pdf') type = 'pdf';
      if (ext === 'txt') type = 'txt';

      // Convert Blob to File
      const fileObj = new File([data], fileName, { type: data.type });
      setFile(fileObj, type);
      router.push('/');
    } catch (err: any) {
      setError('Error al descargar el libro: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)] p-8 text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8 mt-16">
        
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Volver al Lector
        </button>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400">
                <Cloud className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Mi Nube Personal</h1>
                <p className="text-slate-400 mt-1">Guarda tus libros favoritos para leerlos en cualquier dispositivo</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{files.length} <span className="text-slate-500 text-lg">/ 5</span></div>
              <div className="text-xs text-slate-400 uppercase tracking-widest">Archivos Usados</div>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Upload Area */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.epub,.txt"
                onChange={handleUpload}
                disabled={uploading || files.length >= 5}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
                files.length >= 5 
                  ? 'border-slate-700 bg-slate-900/50 opacity-50' 
                  : 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50'
              }`}>
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
                ) : (
                  <Upload className={`w-10 h-10 mb-3 ${files.length >= 5 ? 'text-slate-600' : 'text-blue-400'}`} />
                )}
                <h3 className="text-lg font-bold text-white">
                  {uploading ? 'Subiendo al servidor...' : files.length >= 5 ? 'Almacenamiento lleno' : 'Sube un nuevo libro'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {files.length >= 5 ? 'Debes eliminar un archivo para subir más.' : 'Arrastra o haz clic aquí (PDF, EPUB, TXT)'}
                </p>
              </div>
            </div>

            {/* File List */}
            <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
              {loading && !uploading ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
              ) : files.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aún no tienes libros en la nube.</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {files.map((file) => (
                    <li key={file.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:text-blue-400 transition-colors">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white line-clamp-1">{file.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {(file.metadata?.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenBook(file.name)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Leer
                        </button>
                        <button
                          onClick={() => handleDelete(file.name)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar de la nube"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
