'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveApiKey(apiKey: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No estás autenticado');
    }

    // In a production Vault setup, we would insert this via pgcrypto or supabase vault extension.
    // For this boilerplate, we'll store it in the user_profiles table.
    // We assume the user has run the SQL script to create `user_profiles`.

    // In a real banking-level app, we would use:
    // select vault.create_secret('the_key', 'api_key_name', 'API Key');
    // For simplicity in Next.js Server Actions, we'll encrypt it via a Postgres RPC function or store it securely.

    const { error } = await supabase
      .from('user_profiles')
      .upsert({ 
        id: user.id,
        vault_secret_id: apiKey // Note: In production this should call an RPC that inserts into Vault
      });

    if (error) throw error;
    
    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteAccount() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('No autenticado');

    // Supabase allows deleting users via Admin API or RPC function.
    // Since we don't expose the service_role key to the client, we must use an RPC function 
    // or the Supabase JS admin API (using SUPABASE_SERVICE_ROLE_KEY).
    
    // For this implementation, we use the service role key to delete the user completely.
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
