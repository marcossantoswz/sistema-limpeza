import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Resident } from '../types'; // Assumindo que você tem essa interface definida

export function useResidents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('moradores')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });
      
      if (supabaseError) throw supabaseError;
      
      setResidents(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar moradores:', err);
      setError(err.message || 'Ocorreu um erro ao carregar os moradores.');
    } finally {
      setIsLoading(false);
    }
  };

  // Busca os dados automaticamente ao montar o componente
  useEffect(() => {
    fetchResidents();
  }, []);

  return { 
    residents, 
    isLoading, 
    error, 
    refetch: fetchResidents // Útil para recarregar a lista após adicionar/editar um morador
  };
}