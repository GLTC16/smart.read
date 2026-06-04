import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { ArrowLeft, BookOpen, Globe, Shield, Zap, Brain, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre SmartRead — Tu lector inteligente con traducción instantánea',
  description: 'Conoce SmartRead: el lector web gratuito para PDF, EPUB y TXT con traducción instantánea. Diseñado para estudiantes y lectores que quieren entender más y leer mejor.',
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10 transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Volver al lector
        </Link>

        {/* Hero */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <BookOpen size={24} style={{ color: 'var(--accent-hover)' }} />
            </div>
            <h1 className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>Sobre SmartRead</h1>
          </div>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            SmartRead nació de una necesidad real: leer libros académicos en un idioma extranjero y tener que saltar constantemente al diccionario. Queríamos un lector que entendiera el contexto del estudiante moderno.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12 p-6 rounded-2xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Nuestra Misión</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Democratizar el acceso al conocimiento eliminando la barrera del idioma. Creemos que cualquier estudiante en el mundo debería poder leer cualquier libro, en cualquier idioma, sin fricciones.
          </p>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Qué hace SmartRead</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: BookOpen, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', title: 'Lector Universal', desc: 'Lee PDF, EPUB y TXT directamente en el navegador. Sin instalar nada.' },
              { icon: Globe, color: '#2dd4bf', bg: 'rgba(20,184,166,0.1)', title: 'Traducción Instantánea', desc: 'Selecciona cualquier palabra o frase y obtén la traducción al instante en 8 idiomas.' },
              { icon: Shield, color: '#c4b5fd', bg: 'rgba(139,92,246,0.1)', title: '100% Privado', desc: 'Tus archivos se procesan localmente. Nunca salen de tu dispositivo a menos que uses la nube.' },
              { icon: Zap, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', title: 'Ultrarrápido', desc: 'Sin conversiones, sin esperas. El archivo se abre en segundos directamente en el browser.' },
              { icon: Brain, color: '#f87171', bg: 'rgba(239,68,68,0.1)', title: 'IA de Traducción', desc: 'Integración con MyMemory y Google Translate para traducciones precisas con contexto.' },
              { icon: Users, color: '#34d399', bg: 'rgba(52,211,153,0.1)', title: 'Para Estudiantes', desc: 'Diseñado específicamente para universitarios, idiomas, y lectura académica.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="p-5 rounded-xl" style={{ background: bg, border: `1px solid ${color}22` }}>
                <Icon size={20} style={{ color }} className="mb-3" />
                <h3 className="font-bold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Tecnología</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            SmartRead está construido con tecnologías de última generación: <strong style={{ color: 'var(--text-primary)' }}>Next.js 16</strong> + React 19 para el frontend, <strong style={{ color: 'var(--text-primary)' }}>Supabase</strong> para autenticación y almacenamiento seguro, <strong style={{ color: 'var(--text-primary)' }}>PDF.js</strong> para renderizado de PDFs, y <strong style={{ color: 'var(--text-primary)' }}>epub.js</strong> para libros electrónicos.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Toda la arquitectura está diseñada con privacidad en mente: el procesamiento de archivos ocurre en el navegador del usuario, sin enviar el contenido de los libros a ningún servidor externo.
          </p>
        </section>

        {/* Contact CTA */}
        <section className="p-6 rounded-2xl text-center" style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>¿Preguntas o sugerencias?</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Nos encanta recibir feedback de nuestros usuarios.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--teal)', color: '#fff' }}
          >
            Contactar
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
