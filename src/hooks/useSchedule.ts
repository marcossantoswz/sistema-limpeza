import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Tipagem local simplificada para o retorno do Supabase com JOINs
export interface AssignmentDetail {
  id: string;
  status: 'pendente' | 'concluida';
  peso_historico: number;
  moradores: { id: string; nome: string };
  tarefas: { id: string; nome: string } | null; // null significa Folga
}

export function useSchedule() {
  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Busca a semana que está com status 'atual'
      const { data: week, error: weekError } = await supabase
        .from('semanas')
        .select('*')
        .eq('status', 'atual')
        .maybeSingle(); // maybeSingle evita erro se não houver semana criada ainda

      if (weekError) throw weekError;

      if (week) {
        setCurrentWeek(week);
        
        // 2. Busca as atribuições dessa semana, trazendo os dados do morador e da tarefa
        const { data: attrData, error: attrError } = await supabase
          .from('atribuicoes')
          .select(`
            id, 
            status, 
            peso_historico,
            moradores ( id, nome ),
            tarefas ( id, nome )
          `)
          .eq('semana_id', week.id);
        
        if (attrError) throw attrError;
        setAssignments(attrData as unknown as AssignmentDetail[] || []);
      }
    } catch (err: any) {
      console.error('Erro ao buscar escala:', err);
      setError(err.message || 'Ocorreu um erro ao carregar a escala.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para marcar tarefa como concluída/pendente com Atualização Otimista
  const toggleTaskStatus = async (assignmentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'concluida' ? 'pendente' : 'concluida';
    
    // 1. Atualiza a UI imediatamente (Optimistic Update) para parecer super rápido
    setAssignments(prev => 
      prev.map(a => a.id === assignmentId ? { ...a, status: newStatus } : a)
    );

    // 2. Faz a chamada no banco em background
    const { error: updateError } = await supabase
      .from('atribuicoes')
      .update({ status: newStatus })
      .eq('id', assignmentId);
      
    // 3. Se der erro no banco, reverte a UI para o estado anterior e avisa
    if (updateError) {
      console.error('Erro ao atualizar tarefa:', updateError);
      setAssignments(prev => 
        prev.map(a => a.id === assignmentId ? { ...a, status: currentStatus as 'pendente' | 'concluida' } : a)
      );
      alert('Não foi possível atualizar a tarefa. Tente novamente.');
    }
  };

  useEffect(() => {
    fetchCurrentSchedule();
  }, []);

  return { 
    currentWeek, 
    assignments, 
    isLoading, 
    error, 
    toggleTaskStatus, 
    refetch: fetchCurrentSchedule 
  };
}