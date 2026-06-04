'use client';

import { useState } from 'react';
import { saveApiKey, deleteAccount } from '@/app/actions/profile';
import { createClient } from '@/utils/supabase/client';
import { Shield, Key, AlertTriangle, LogOut, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveApiKey(apiKey);
    setLoading(false);
    if (res.success) {
      setMessage('Clave guardada en la Bóveda Cifrada correctamente.');
      setApiKey('');
    } else {
      setMessage('Error: ' + res.error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('¿Estás seguro? Esta acción es irreversible y borrará todos tus libros y datos (GDPR - Derecho al Olvido).');
    if (!confirm) return;

    setLoading(true);
    const res = await deleteAccount();
    if (res.success) {
      await supabase.auth.signOut();
      router.push('/login');
    } else {
      setMessage('Error al borrar la cuenta: ' + res.error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirm = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (!confirm) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)] p-8 text-slate-200">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Volver al Lector
        </button>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="p-4 bg-purple-500/20 rounded-2xl text-purple-400">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Centro de Seguridad</h1>
              <p className="text-slate-400 mt-1">Configuración y privacidad de grado corporativo</p>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/50 text-purple-400">
              {message}
            </div>
          )}

          <div className="space-y-12">
            {/* API Key Vault */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" /> Bóveda de Traducción (API Key)
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Si deseas usar tu propia API de traducción (ej: MyMemory Pro, DeepL, OpenAI), pégala aquí. 
                Será encriptada a nivel militar usando <strong>AES-256 (Supabase Vault)</strong>. Ni siquiera los administradores podrán leerla.
              </p>
              <form onSubmit={handleSaveKey} className="flex gap-4">
                <input
                  type="password"
                  placeholder="Tu API Key Secreta"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Guardar Cifrado
                </button>
              </form>
            </section>

            {/* Performance */}
            <section className="pt-8 border-t border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-teal-400">⚡</span> Optimización y Rendimiento
              </h2>
              <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div>
                  <h3 className="text-white font-bold">Limpiar Caché Local</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-md">
                    Si tienes problemas con sesiones atascadas (especialmente en Safari), usa este botón para forzar una limpieza completa del navegador.
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="px-6 py-3 bg-teal-600/20 text-teal-400 border border-teal-500/50 hover:bg-teal-600 hover:text-white rounded-xl font-medium transition-all"
                >
                  Limpiar Caché
                </button>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-8 border-t border-red-500/20">
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Zona de Peligro (GDPR)
              </h2>
              <div className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <div>
                  <h3 className="text-white font-bold">Derecho al Olvido</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-md">
                    Eliminar tu cuenta borrará permanentemente todos tus libros, API Keys cifradas y metadatos de nuestros servidores en Europa.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600 hover:text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  Destruir mi cuenta
                </button>
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white px-6 py-3 rounded-xl hover:bg-white/5 transition-all">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
