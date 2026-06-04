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
    <main className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center p-4">
      <div className="w-full max-w-7xl relative">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-[128px] pointer-events-none" />
        
        <AuthUI />
      </div>
    </main>
  );
}
