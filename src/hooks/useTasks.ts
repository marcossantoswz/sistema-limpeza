// src/hooks/useTasks.ts
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Task } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('tarefas')
        .select('*')
        .eq('ativo', true)
        .order('peso', { ascending: false }); // Lista as mais pesadas primeiro
      
      if (supabaseError) throw supabaseError;
      
      setTasks(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar tarefas:', err);
      setError(err.message || 'Ocorreu um erro ao carregar as tarefas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { 
    tasks, 
    isLoading, 
    error, 
    refetch: fetchTasks 
  };
}