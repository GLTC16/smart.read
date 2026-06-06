import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import AdUnit from '@/components/AdUnit';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos de Servicio — SmartRead',
  description: 'Términos y Condiciones de uso de SmartRead. Lee las condiciones antes de usar nuestro lector inteligente.',
  robots: { index: true, follow: true },
};

const section = (title: string, content: React.ReactNode) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h2>
    <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--text-secondary)' }}>
      {content}
    </div>
  </section>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-10 transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Volver al inicio
        </Link>

        <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Términos de Servicio</h1>
        <p className="text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
          Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {section('1. Aceptación de los Términos', (
          <p>Al acceder y utilizar SmartRead, aceptas estos Términos de Servicio. Si no estás de acuerdo con alguno de ellos, te pedimos que no utilices el servicio.</p>
        ))}

        {section('2. Descripción del servicio', (
          <>
            <p>SmartRead es un lector web gratuito que permite leer archivos PDF, EPUB y TXT directamente en el navegador, con traducción instantánea del texto seleccionado. El servicio incluye funciones opcionales de almacenamiento en la nube para usuarios registrados.</p>
            <p>El procesamiento de archivos se realiza principalmente de forma local en tu dispositivo. SmartRead no almacena ni analiza el contenido de tus libros salvo cuando uses la función "Mi Nube".</p>
          </>
        ))}

        {section('3. Uso aceptable', (
          <>
            <p>Te comprometes a:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Usar el servicio únicamente con archivos de los que tienes derechos legítimos (libros comprados, de dominio público, o de tu propia autoría).</li>
              <li>No intentar vulnerar la seguridad del servicio ni acceder a datos de otros usuarios.</li>
              <li>No usar el servicio para fines ilegales, fraudulentos o que violen derechos de terceros.</li>
              <li>No distribuir ni revender el acceso al servicio sin autorización escrita.</li>
            </ul>
          </>
        ))}

        {section('4. Contenido del usuario', (
          <>
            <p>Eres el único responsable de los archivos que subes a SmartRead. No subas contenido que infrinja derechos de autor, sea ilegal, pornográfico, violento o difamatorio.</p>
            <p>SmartRead se reserva el derecho de eliminar contenido o suspender cuentas que violen estas condiciones, sin previo aviso.</p>
          </>
        ))}

        {section('5. Límites de almacenamiento', (
          <p>La función "Mi Nube" está limitada a <strong style={{ color: 'var(--text-primary)' }}>5 archivos por cuenta</strong> con un máximo de <strong style={{ color: 'var(--text-primary)' }}>15 MB por archivo</strong>. SmartRead se reserva el derecho de modificar estos límites previo aviso.</p>
        ))}

        {section('6. Disponibilidad del servicio', (
          <p>SmartRead ofrece el servicio "tal cual" (as is). No garantizamos disponibilidad ininterrumpida. Podemos modificar, suspender o interrumpir el servicio en cualquier momento, con o sin previo aviso.</p>
        ))}

        {section('7. Propiedad intelectual', (
          <p>El código, diseño, marca SmartRead y todos los elementos del sitio son propiedad exclusiva de SmartRead. No puedes copiar, modificar ni distribuir estos elementos sin autorización expresa por escrito.</p>
        ))}

        {section('8. Limitación de responsabilidad', (
          <>
            <p>SmartRead no se hace responsable de pérdidas de datos, interrupciones del servicio, traduciones incorrectas ni de cualquier daño directo o indirecto derivado del uso de la plataforma.</p>
            <p>La función de traducción usa APIs de terceros (MyMemory, Google Translate) y los resultados pueden contener errores.</p>
          </>
        ))}

        {section('9. Publicidad', (
          <p>SmartRead puede mostrar anuncios de Google AdSense en el sitio. La publicidad solo se carga con tu consentimiento explícito. Los anuncios están claramente diferenciados del contenido editorial.</p>
        ))}

        {section('10. Modificaciones', (
          <p>Podemos actualizar estos Términos en cualquier momento. El uso continuado del servicio tras la publicación de cambios implica tu aceptación de los nuevos Términos.</p>
        ))}

        {section('11. Ley aplicable', (
          <p>Estos Términos se rigen por la legislación española e italiana. Cualquier disputa se resolverá ante los tribunales competentes de Milano, Italia.</p>
        ))}

        {section('12. Contacto', (
          <p>Para cualquier consulta sobre estos Términos: <strong style={{ color: 'var(--text-primary)' }}>support@smartread.app</strong></p>
        ))}
        <AdUnit slot="4444444444" format="horizontal" className="mt-8" />
      </main>
      <Footer />
    </div>
  );
}
