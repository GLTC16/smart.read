'use client';

import Link from 'next/link';
import { UserCircle, Cloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <div className="fixed top-4 right-6 z-50 flex items-center gap-3">
      {user && (
        <Link
          href="/cloud"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-100 text-sm font-medium transition-all backdrop-blur-md shadow-lg"
        >
          <Cloud className="w-5 h-5" />
          <span className="hidden sm:inline">Mi Nube (Máx 5)</span>
        </Link>
      )}
      <Link
        href={user ? "/profile" : "/login"}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-100 text-sm font-medium transition-all backdrop-blur-md shadow-lg"
      >
        <UserCircle className="w-5 h-5" />
        <span className="hidden sm:inline">{user ? "Mi Perfil Seguro" : "Iniciar Sesión"}</span>
      </Link>
    </div>
  );
}
