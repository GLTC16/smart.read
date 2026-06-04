'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, User, Key, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthUI() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devSecret, setDevSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register' | 'recovery' | 'dev'>('login');
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

  const handleDevBypass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/dev-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: devSecret })
      });
      if (!res.ok) throw new Error('Credenciales inválidas');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-900/20 text-slate-200">
      <div className="text-center mb-8">
        <ShieldCheck className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Cuenta' : mode === 'recovery' ? 'Recuperar Acceso' : 'Acceso de Desarrollador'}
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

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm">
          {message}
        </div>
      )}

      {mode === 'dev' ? (
        <form onSubmit={handleDevBypass} className="space-y-4">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Clave Maestra Secreta"
              value={devSecret}
              onChange={(e) => setDevSecret(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium hover:from-red-500 hover:to-orange-500 focus:ring-2 focus:ring-red-500/50 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bypass Activo'}
          </button>
        </form>
      ) : (
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
              mode === 'login' ? 'Entrar' : mode === 'register' ? 'Registrarse' : 'Enviar Correo'
            )}
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3 text-sm">
        {mode !== 'login' && (
          <button onClick={() => { setMode('login'); setError(null); }} className="text-purple-400 hover:text-purple-300 transition-colors">
            Ya tengo una cuenta. Iniciar sesión.
          </button>
        )}
        {mode !== 'register' && mode !== 'dev' && (
          <button onClick={() => { setMode('register'); setError(null); }} className="text-slate-400 hover:text-white transition-colors">
            ¿No tienes cuenta? Regístrate gratis.
          </button>
        )}
        {mode === 'login' && (
          <button onClick={() => { setMode('recovery'); setError(null); }} className="text-slate-400 hover:text-white transition-colors">
            Olvidé mi contraseña
          </button>
        )}
        {mode !== 'dev' && (
          <button onClick={() => { setMode('dev'); setError(null); }} className="text-red-400/50 hover:text-red-400 transition-colors pt-4 text-xs">
            Admin / Dev Bypass
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
    </div>
  );
}
