import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to get employee by auth user ID
export async function getEmployeeByAuthId(authUserId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      roles (
        id,
        name
      )
    `)
    .eq('auth_user_id', authUserId)
    .eq('active', true)
    .single();

  if (error) throw error;
  return data;
}

// Helper to check if user is CEO/Admin
export function isCEO(employee: any): boolean {
  return employee?.roles?.name === 'CEO';
}
