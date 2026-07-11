import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface RankingItem {
  morador_id: string;
  nome: string;
  tarefas_concluidas: number;
  peso_acumulado: number;
  total_folgas: number;
  tarefas_perdidas: number; // <-- Novo campo adicionado!
}

export function useRanking() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vw_ranking_moradores')
        .select('*')
        .order('peso_acumulado', { ascending: false })
        .order('tarefas_concluidas', { ascending: false });

      if (error) throw error;
      setRanking(data || []);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  return { ranking, isLoading, refetch: fetchRanking };
}