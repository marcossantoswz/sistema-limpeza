import { supabase } from './supabase';
import { generateNextWeekSchedule } from '../utils/scheduler/schedulerAlgorithm';
import type { Resident, Task } from '../types'; // Assuma que você tem essas tipagens

// ==========================================
// FUNÇÕES DE BUSCA (FETCH)
// ==========================================

export async function getActiveResidents(): Promise<Resident[]> {
  const { data, error } = await supabase
    .from('moradores')
    .select('*')
    .eq('ativo', true);

  if (error) throw new Error(`Erro ao buscar moradores: ${error.message}`);
  return data || [];
}

export async function getActiveTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('ativo', true);

  if (error) throw new Error(`Erro ao buscar tarefas: ${error.message}`);
  return data || [];
}

// ==========================================
// FUNÇÕES DE ATUALIZAÇÃO (UPDATE)
// ==========================================

export async function updateAssignmentStatus(assignmentId: string, newStatus: 'pendente' | 'concluida'): Promise<void> {
  const { error } = await supabase
    .from('atribuicoes')
    .update({ status: newStatus })
    .eq('id', assignmentId);

  if (error) throw new Error(`Erro ao atualizar status da tarefa: ${error.message}`);
}

// ==========================================
// REGRA DE NEGÓCIO: FECHAR SEMANA
// ==========================================

export async function closeAndGenerateWeek(): Promise<boolean> {
  try {
    // 1. Arquivar a semana atual
    await supabase
      .from('semanas')
      .update({ status: 'arquivada' })
      .eq('status', 'atual');

    // 2. Buscar dados necessários para o algoritmo
    const residents = await getActiveResidents();
    const tasks = await getActiveTasks();
    
    const { data: history, error: historyError } = await supabase
    .from('atribuicoes')
    .select(`
      *,
      semanas!inner(status, data_inicio, created_at)
    `);

    if (historyError) throw historyError;

    // 3. Executar o Algoritmo
    const newAssignments = generateNextWeekSchedule(residents, tasks, history || []);

    // 4. Criar a nova semana
    const today = new Date();
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 7);

    // Formatar datas para YYYY-MM-DD para o PostgreSQL
    const dataInicioStr = today.toISOString().split('T')[0];
    const dataFimStr = nextWeekEnd.toISOString().split('T')[0];

    const { data: newWeek, error: weekError } = await supabase
      .from('semanas')
      .insert([{ data_inicio: dataInicioStr, data_fim: dataFimStr, status: 'atual' }])
      .select()
      .single();

    if (weekError) throw weekError;

    // 5. Inserir as novas atribuições no banco
    const assignmentsToInsert = newAssignments.map(a => ({
      semana_id: newWeek.id,
      morador_id: a.residentId,
      tarefa_id: a.taskId,
      peso_historico: a.weight,
      status: a.taskId ? 'pendente' : 'concluida' // Folgas já nascem "concluídas"
    }));

    const { error: insertError } = await supabase
      .from('atribuicoes')
      .insert(assignmentsToInsert);
    
    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error('Falha crítica ao fechar a semana:', error);
    throw error;
  }
}