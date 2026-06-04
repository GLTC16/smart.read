'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ShieldAlert } from 'lucide-react';

export default function GDPRBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = Cookies.get('gdpr_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set('gdpr_consent', 'accepted', { expires: 180 }); // 6 months per Italian law
    setShowBanner(false);
  };

  const handleReject = () => {
    Cookies.set('gdpr_consent', 'rejected', { expires: 180 });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[99999] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-5xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-full text-purple-400 shrink-0 mt-1">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Tu Privacidad es Nuestra Prioridad</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Utilizamos cookies propias estrictamente necesarias para el funcionamiento del inicio de sesión (Auth) y preferencias del lector. De acuerdo con la normativa del <strong>Garante per la protezione dei dati personali</strong>, puedes elegir si deseas aceptar cookies de análisis opcionales. Puedes cambiar de opinión en cualquier momento.
            </p>
          </div>
        </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all whitespace-nowrap"
            >
              Rechazar
            </button>
            <button
              onClick={() => {
                Cookies.set('gdpr_consent', 'essentials_only', { expires: 180 });
                setShowBanner(false);
              }}
              className="px-4 py-2 text-sm rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all whitespace-nowrap"
            >
              Solo Esenciales
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-500 font-bold transition-all shadow-lg shadow-purple-900/50 whitespace-nowrap"
            >
              Aceptar Todo
            </button>
          </div>

      </div>
    </div>
  );
}
