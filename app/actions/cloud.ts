'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function listCloudFiles() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('No autenticado');

    // List files in the user's folder
    const { data, error } = await supabase.storage.from('books').list(user.id);
    if (error) throw error;

    return { success: true, files: data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCloudFile(fileName: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('No autenticado');

    const { error } = await supabase.storage.from('books').remove([`${user.id}/${fileName}`]);
    if (error) throw error;

    revalidatePath('/cloud');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Uploading requires sending a FormData from the client directly to Supabase via the client SDK, 
// because passing a File object through Server Actions is inefficient and has size limits.
// So uploading will be handled in the client side components, but we'll use this file for listing and deleting.
