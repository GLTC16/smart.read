import AuthUI from '@/components/AuthUI';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10%', right: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <AuthUI />
      </div>
    </main>
  );
}
