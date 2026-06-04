'use client';

import Link from 'next/link';
import { UserCircle, Cloud, LogOut, Settings } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
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
    <div className="fixed top-4 right-5 z-[100]" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="flex items-center justify-center w-11 h-11 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
        style={{
          background: 'rgba(20,20,40,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <UserCircle className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-14 right-0 w-52 py-1.5 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10,10,22,0.96)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 20px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
              transformOrigin: 'top right',
            }}
          >
            {user ? (
              <>
                <div className="px-4 py-2.5 border-b border-white/[0.07] mb-0.5">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Cuenta</p>
                  <p className="text-sm text-white/80 truncate font-medium">{user.email}</p>
                </div>

                {([
                  { href: '/cloud', icon: Cloud, label: 'Mi Nube' },
                  { href: '/profile', icon: Settings, label: 'Ajustes' },
                ] as const).map(({ href, icon: Icon, label }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.15 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t border-white/[0.05] mt-0.5">
                  <motion.button
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08, duration: 0.15 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.07] transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </motion.button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <UserCircle className="w-4 h-4" />
                Iniciar Sesión
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
