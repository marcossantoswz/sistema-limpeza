import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente no Vite começam com import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).');
}

// Cria e exporta a instância única do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);