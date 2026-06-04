'use client';

import Link from 'next/link';
import { UserCircle, Cloud, LogOut, Settings } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Force cache invalidation on auth state change
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="fixed top-4 right-6 z-[100]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1a1a2e]/80 hover:bg-[#1a1a2e] border border-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md shadow-lg"
      >
        <UserCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 w-48 py-2 rounded-xl bg-[#0c0c16]/90 backdrop-blur-xl border border-white/10 shadow-2xl origin-top-right animate-in fade-in zoom-in-95 duration-200">
          {user ? (
            <>
              <div className="px-4 py-2 border-b border-white/10 mb-1">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Cuenta</p>
                <p className="text-sm text-white/90 truncate">{user.email}</p>
              </div>
              <Link
                href="/cloud"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Cloud className="w-4 h-4" />
                Mi Nube
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Ajustes
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors mt-1 border-t border-white/5"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
