import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import AdUnit from '@/components/AdUnit';
import { ArrowLeft, Mail, MessageCircle, Bug, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contacto — SmartRead',
  description: 'Contacta con el equipo de SmartRead. Soporte técnico, sugerencias, reportar errores o colaboraciones.',
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  const topics = [
    { icon: Bug, color: '#f87171', bg: 'rgba(239,68,68,0.1)', title: 'Reportar un error', desc: 'Algo no funciona como esperabas' },
    { icon: Lightbulb, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', title: 'Sugerencia', desc: 'Tienes una idea para mejorar SmartRead' },
    { icon: MessageCircle, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', title: 'Soporte', desc: 'Necesitas ayuda con el servicio' },
    { icon: Mail, color: '#2dd4bf', bg: 'rgba(20,184,166,0.1)', title: 'Colaboración', desc: 'Propuestas de negocio o partnerships' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <main className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10 transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Volver al inicio
        </Link>

        <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Contacto</h1>
        <p className="text-sm mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Estamos aquí para ayudarte. Escríbenos sobre cualquiera de estos temas:
        </p>

        {/* Topic cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {topics.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="p-5 rounded-xl" style={{ background: bg, border: `1px solid ${color}25` }}>
              <Icon size={20} style={{ color }} className="mb-3" />
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>

        <AdUnit slot="2222222222" format="horizontal" className="mb-8" />

        {/* Email CTA */}
        <div
          className="p-8 rounded-2xl text-center"
          style={{ background: 'rgba(15,15,28,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Mail size={22} style={{ color: 'var(--accent-hover)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Escríbenos</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Respondemos en menos de 48 horas laborables.</p>
          <a
            href="mailto:support@smartread.app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
          >
            <Mail size={15} />
            support@smartread.app
          </a>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Para solicitudes RGPD o eliminación de cuenta, visita{' '}
              <Link href="/privacy" className="underline hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
