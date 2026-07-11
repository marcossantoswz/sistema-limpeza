// src/utils/scheduler/schedulerAlgorithm.ts

import type { Task, Resident, AssignmentHistory } from '../../types';

interface ResidentStats {
  id: string;
  totalWeight: number;
  totalOffs: number;
  weeksWithoutOff: number;
  taskCounts: Record<string, number>;
  lastWeekTaskId: string | null;
}

export function generateNextWeekSchedule(
  residents: Resident[],
  tasks: Task[],
  history: AssignmentHistory[]
): { residentId: string; taskId: string | null; weight: number }[] {
  
  // 1. Inicializa os status de cada morador
  const stats: Record<string, ResidentStats> = {};
  residents.forEach(r => {
    stats[r.id] = { 
      id: r.id, 
      totalWeight: 0, 
      totalOffs: 0,
      weeksWithoutOff: 0,
      taskCounts: {}, 
      lastWeekTaskId: null 
    };
  });

  // 2. Descobre qual foi a última semana baseada na data de início
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.semanas.data_inicio).getTime() - new Date(a.semanas.data_inicio).getTime()
  );
  const lastWeekId = sortedHistory.length > 0 ? sortedHistory[0].semana_id : null;

  // Descobre há quantas semanas cada morador está sem folga
// 3. Descobre há quantas semanas consecutivas cada morador está SEM folga.
// A lógica é: olhamos da semana mais recente para a mais antiga.
// Se o morador tem uma tarefa na semana X, o contador aumenta.
// Se ele tem folga (null) na semana X, ou não existe registro na semana X, o contador para.

const weekIds = [...new Set(history.map(h => h.semana_id))];
// Ordena as semanas da mais recente para a mais antiga baseada na data de início
const sortedWeekIds = weekIds.sort((a, b) => {
  const dateA = history.find(h => h.semana_id === a)!.semanas.data_inicio;
  const dateB = history.find(h => h.semana_id === b)!.semanas.data_inicio;
  return new Date(dateB).getTime() - new Date(dateA).getTime();
});

residents.forEach(r => {
  let count = 0;
  
  // Itera sobre as semanas ordenadas
  for (const weekId of sortedWeekIds) {
    // Busca o registro do morador nesta semana específica
    const record = history.find(
      h => h.semana_id === weekId && h.morador_id === r.id
    );

    // Se o morador não estava na casa nessa semana, paramos a contagem
    if (!record) break;

    // Se ele teve folga nesta semana, a contagem de semanas SEM folga reseta para 0
    if (record.tarefa_id === null) {
      break; 
    }

    // Se ele teve tarefa, incrementa a contagem
    count++;
  }
  
  // Salva o resultado no stats
  stats[r.id].weeksWithoutOff = count;
});

  // 3. Compila o currículo histórico de cada morador
  history.forEach(record => {
    if (!stats[record.morador_id]) return; // Ignora moradores inativos antigos
    
    if (record.tarefa_id === null) {
      stats[record.morador_id].totalOffs += 1;
    } else {
      stats[record.morador_id].totalWeight += record.peso_historico;
      stats[record.morador_id].taskCounts[record.tarefa_id] = 
        (stats[record.morador_id].taskCounts[record.tarefa_id] || 0) + 1;
    }

    if (record.semana_id === lastWeekId) {
      stats[record.morador_id].lastWeekTaskId = record.tarefa_id;
    }
  });

  let availableResidents = [...residents];
  const newAssignments: { residentId: string; taskId: string | null; weight: number }[] = [];
  
  // 4. Determinar e Distribuir Folgas (Prioridade Máxima)
  const numOffs = Math.max(0, availableResidents.length - tasks.length);
  
  if (numOffs > 0) {
    // Ordena quem teve menos folgas. Em caso de empate absoluto, aleatório.
    availableResidents.sort((a, b) => {
      const diff =
        stats[b.id].weeksWithoutOff -
        stats[a.id].weeksWithoutOff;


        if(diff !== 0)
        return diff;

      const offDiff =
        stats[a.id].totalOffs -
        stats[b.id].totalOffs;

      if(offDiff !== 0)
        return offDiff;


      // desempate aleatório
      return Math.random() - 0.5;
      //return diff !== 0 ? diff : Math.random() - 0.5;
    });
    console.log(
  availableResidents.map(r => ({
    nome:r.nome,
    semFolga:stats[r.id].weeksWithoutOff,
    folgas:stats[r.id].totalOffs
  }))
);

    const offResidents = availableResidents.splice(0, numOffs);
    console.log(
  "Folgas escolhidas:",
  offResidents.map(r => r.nome)
);
    offResidents.forEach(r => {
      newAssignments.push({ residentId: r.id, taskId: null, weight: 0 }); 
    });
  }

  // 5. Ordenar tarefas: da mais pesada para a mais leve
  const sortedTasks = [...tasks].sort((a, b) => b.peso - a.peso);

  // 6. Distribuir Tarefas Baseado no Score de Justiça
  sortedTasks.forEach(task => {
    availableResidents.sort((a, b) => {
      const statsA = stats[a.id];
      const statsB = stats[b.id];

      // Regra 1: Penalidade infinita para não repetir a mesma tarefa da semana passada
      const isConsecutiveA = statsA.lastWeekTaskId === task.id;
      const isConsecutiveB = statsB.lastWeekTaskId === task.id;
      
      if (isConsecutiveA && !isConsecutiveB) return 1;
      if (!isConsecutiveA && isConsecutiveB) return -1;

      // Regra 2: Score = (Vezes que já fez essa tarefa * 100) + Peso Total Acumulado
      // O multiplicador 100 garante que a rotação de tarefas seja mais importante que o peso geral
      const scoreA = ((statsA.taskCounts[task.id] || 0) * 100) + statsA.totalWeight;
      const scoreB = ((statsB.taskCounts[task.id] || 0) * 100) + statsB.totalWeight;

      const diff = scoreA - scoreB;
      // Empate resolvido de forma justa (aleatório entre os elegíveis iguais)
      return diff !== 0 ? diff : Math.random() - 0.5; 
    });

    // O morador com o MENOR score assume a tarefa (está no topo do array após o sort)
    const selectedResident = availableResidents.shift(); 
    
    if (selectedResident) {
      newAssignments.push({
        residentId: selectedResident.id,
        taskId: task.id,
        weight: task.peso
      });
      
      // Atualiza os status virtuais para a próxima iteração do loop não escalar a mesma pessoa
      stats[selectedResident.id].totalWeight += task.peso;
      stats[selectedResident.id].taskCounts[task.id] = 
        (stats[selectedResident.id].taskCounts[task.id] || 0) + 1;
    }
  });

  return newAssignments;
}