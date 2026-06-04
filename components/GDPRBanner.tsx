'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GDPRBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!Cookies.get('gdpr_consent')) setShowBanner(true);
  }, []);

  const accept = (value: string) => {
    Cookies.set('gdpr_consent', value, { expires: 180 });
    setShowBanner(false);
  };

  const btnBase = 'px-5 py-2 text-sm font-medium rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer';

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          className="fixed bottom-0 left-0 w-full z-[99999] p-4"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
        >
          <div
            className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 p-5 rounded-2xl"
            style={{
              background: 'rgba(10,10,22,0.97)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 -4px 48px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-2.5 rounded-xl shrink-0 mt-0.5"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent-hover)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  Tu Privacidad es Nuestra Prioridad
                </h3>
                <p className="text-xs leading-relaxed max-w-xl" style={{ color: 'var(--text-muted)' }}>
                  Usamos cookies necesarias para auth y preferencias de lectura. Conforme al{' '}
                  <strong style={{ color: 'var(--text-secondary)' }}>Garante per la protezione dei dati personali</strong>.
                  Puedes cambiar tu elección en cualquier momento.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => accept('rejected')}
                className={btnBase}
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
              >
                Rechazar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => accept('essentials_only')}
                className={btnBase}
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
              >
                Solo Esenciales
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => accept('accepted')}
                className={btnBase}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  fontWeight: 700,
                  boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                }}
              >
                Aceptar Todo
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
