'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, User, Key, ArrowRight, ShieldCheck, Loader2, Chrome } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthUI() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devSecret, setDevSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage('Revisa tu correo para confirmar tu cuenta.');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });
        if (error) throw error;
        setMessage('Se ha enviado un enlace de recuperación a tu correo.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error con Google Auth');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="w-full p-8 rounded-3xl text-slate-200"
      style={{
        background: 'rgba(15,15,28,0.85)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
      }}
    >
      <div className="text-center mb-8">
        <ShieldCheck className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Cuenta' : 'Recuperar Acceso'}
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Sistema cifrado con seguridad de grado corporativo
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tabs for Login / Register */}
      {(mode === 'login' || mode === 'register') && (
        <div className="flex p-1 bg-black/20 rounded-xl mb-6">
          <button
            onClick={() => { setMode('login'); setError(null); setMessage(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-purple-600/30 text-white shadow-sm border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); setMessage(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-purple-600/30 text-white shadow-sm border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Regístrate
          </button>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm">
          {message}
        </div>
      )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              required
            />
          </div>

          {mode !== 'recovery' && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 focus:ring-2 focus:ring-purple-500/50 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              mode === 'login' ? 'Entrar con Email' : mode === 'register' ? 'Registrarse' : 'Enviar Correo'
            )}
          </button>
        </form>

      {mode !== 'recovery' && (
        <>
          <div className="flex items-center gap-4 my-6 opacity-30">
            <div className="flex-1 h-px bg-white"></div>
            <span className="text-xs uppercase font-bold text-white tracking-widest">o continúa con</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <Chrome className="w-5 h-5 text-blue-600" />
            Google
          </button>
        </>
      )}

      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3 text-sm">
        {mode === 'recovery' && (
          <button onClick={() => { setMode('login'); setError(null); }} className="text-purple-400 hover:text-purple-300 transition-colors">
            Volver a iniciar sesión
          </button>
        )}
        {mode === 'login' && (
          <button onClick={() => { setMode('recovery'); setError(null); }} className="text-slate-400 hover:text-white transition-colors">
            Olvidé mi contraseña
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <button 
          onClick={() => router.push('/')}
          className="text-slate-500 hover:text-white text-sm flex items-center justify-center mx-auto gap-2 transition-colors"
        >
          Continuar como Invitado <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
