import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad — SmartRead',
  description: 'Política de Privacidad de SmartRead. Cómo recopilamos, usamos y protegemos tus datos personales conforme al RGPD.',
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-10 transition-colors hover:text-white"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={15} /> Volver al inicio
        </Link>

        <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          Política de Privacidad
        </h1>
        <p className="text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
          Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {section('1. Responsable del tratamiento', (
          <>
            <p>El responsable del tratamiento de los datos personales recogidos a través de SmartRead es el equipo de SmartRead, contactable a través de <strong style={{ color: 'var(--text-primary)' }}>support@smartread.app</strong>.</p>
            <p>SmartRead opera conforme al Reglamento General de Protección de Datos (RGPD / GDPR) de la Unión Europea y la normativa italiana del <em>Garante per la protezione dei dati personali</em>.</p>
          </>
        ))}

        {section('2. Datos que recopilamos', (
          <>
            <p><strong style={{ color: 'var(--text-primary)' }}>Datos de cuenta (si te registras):</strong> dirección de correo electrónico, contraseña cifrada. Gestionados a través de Supabase Auth.</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Archivos de libros:</strong> los archivos PDF, EPUB y TXT que subes se procesan localmente en tu navegador. No se transmiten a nuestros servidores salvo que uses la función "Mi Nube", en cuyo caso se almacenan cifrados en Supabase Storage.</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Datos de uso anónimos:</strong> con tu consentimiento explícito, podemos recopilar datos de uso anónimos para mejorar el servicio.</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Cookies técnicas:</strong> usamos cookies estrictamente necesarias para la sesión de autenticación. Nunca usamos cookies sin tu consentimiento previo.</p>
          </>
        ))}

        {section('3. Cookies y publicidad (Google AdSense)', (
          <>
            <p>Con tu consentimiento explícito (opción "Aceptar Todo" en el banner de cookies), SmartRead puede mostrar anuncios a través de <strong style={{ color: 'var(--text-primary)' }}>Google AdSense</strong>.</p>
            <p>Google AdSense utiliza cookies para mostrar anuncios basados en tus visitas anteriores a este sitio web y a otros sitios de Internet. Google puede usar la información de tus visitas para personalizar los anuncios que ves.</p>
            <p>Puedes desactivar el uso de cookies de personalización de anuncios visitando <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent-hover)' }}>Configuración de anuncios de Google</a>.</p>
            <p>Si rechazas las cookies opcionales o eliges "Solo Esenciales", Google AdSense no se cargará y no se mostrará ningún anuncio personalizado.</p>
          </>
        ))}

        {section('4. Finalidad del tratamiento', (
          <>
            <p>Los datos se tratan para:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Gestionar tu cuenta y sesión de usuario.</li>
              <li>Almacenar tus libros en la nube (opcional, requiere cuenta).</li>
              <li>Prestar el servicio de traducción instantánea de texto seleccionado.</li>
              <li>Mostrar publicidad relevante con tu consentimiento (Google AdSense).</li>
              <li>Mejorar el servicio mediante análisis anónimo de uso.</li>
            </ul>
          </>
        ))}

        {section('5. Base legal', (
          <>
            <p>El tratamiento se basa en: <strong style={{ color: 'var(--text-primary)' }}>ejecución de un contrato</strong> (prestación del servicio), <strong style={{ color: 'var(--text-primary)' }}>consentimiento explícito</strong> (cookies opcionales y publicidad), e <strong style={{ color: 'var(--text-primary)' }}>interés legítimo</strong> (seguridad y prevención del fraude).</p>
          </>
        ))}

        {section('6. Conservación de datos', (
          <>
            <p>Los datos de cuenta se conservan mientras tengas una cuenta activa. Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento desde <Link href="/profile" className="underline" style={{ color: 'var(--accent-hover)' }}>Mi Perfil</Link> (Derecho al Olvido, Art. 17 RGPD).</p>
            <p>Los archivos almacenados en la nube se eliminan inmediatamente al borrar la cuenta o al eliminarlos manualmente.</p>
          </>
        ))}

        {section('7. Tus derechos (RGPD)', (
          <>
            <p>Tienes derecho a: acceso, rectificación, supresión, oposición, portabilidad y limitación del tratamiento. Para ejercerlos, escríbenos a <strong style={{ color: 'var(--text-primary)' }}>support@smartread.app</strong>.</p>
            <p>También tienes derecho a presentar una reclamación ante la autoridad de control competente (Agencia Española de Protección de Datos o el Garante italiano).</p>
          </>
        ))}

        {section('8. Seguridad', (
          <>
            <p>Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos: cifrado en tránsito (HTTPS/TLS), cifrado en reposo en Supabase, autenticación segura con hash de contraseñas.</p>
          </>
        ))}

        {section('9. Transferencias internacionales', (
          <>
            <p>Supabase opera bajo Cláusulas Contractuales Tipo aprobadas por la Comisión Europea. Google LLC está sujeta al Data Privacy Framework UE-EE.UU.</p>
          </>
        ))}

        {section('10. Cambios en esta política', (
          <>
            <p>Podemos actualizar esta política. Notificaremos cambios significativos por correo electrónico (si tienes cuenta) o mediante aviso en el sitio.</p>
          </>
        ))}
      </main>
      <Footer />
    </div>
  );
}
