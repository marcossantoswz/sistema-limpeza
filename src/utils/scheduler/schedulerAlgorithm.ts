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

  // 2. Descobre qual foi a última semana baseada em quando foi CRIADA
  // (não na data_inicio, que pode se repetir se várias semanas forem
  // finalizadas no mesmo dia durante testes)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.semanas.created_at).getTime() - new Date(a.semanas.created_at).getTime()
  );
  const lastWeekId = sortedHistory.length > 0 ? sortedHistory[0].semana_id : null;

  // 3. Descobre há quantas semanas consecutivas cada morador está SEM folga.
  const weekIds = [...new Set(history.map(h => h.semana_id))];
  const sortedWeekIds = weekIds.sort((a, b) => {
    const dateA = history.find(h => h.semana_id === a)!.semanas.created_at;
    const dateB = history.find(h => h.semana_id === b)!.semanas.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  residents.forEach(r => {
    let count = 0;
    for (const weekId of sortedWeekIds) {
      const record = history.find(
        h => h.semana_id === weekId && h.morador_id === r.id
      );
      if (!record) break;
      if (record.tarefa_id === null) break;
      count++;
    }
    stats[r.id].weeksWithoutOff = count;
  });

  // 4. Compila o currículo histórico de cada morador
  history.forEach(record => {
    if (!stats[record.morador_id]) return;

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

  // ==========================================================
  // REGRA 3 e 4: Tarefa não concluída trava a pessoa
  // na mesma tarefa + penalidade de -1 no weeksWithoutOff
  // ==========================================================
  let availableResidents = [...residents];
  let availableTasks = [...tasks];
  const newAssignments: { residentId: string; taskId: string | null; weight: number }[] = [];
  const lockedResidentIds = new Set<string>();

  if (lastWeekId) {
    residents.forEach(r => {
      const lastWeekRecord = history.find(
        h => h.semana_id === lastWeekId && h.morador_id === r.id
      );

      // Só se aplica se: teve tarefa (não era folga) E não foi concluída
      const naoCompletou =
        lastWeekRecord &&
        lastWeekRecord.tarefa_id !== null &&
        lastWeekRecord.status === 'pendente';

      if (naoCompletou) {
        const tarefaPendente = tasks.find(t => t.id === lastWeekRecord!.tarefa_id);

        // REGRA 4: penalidade -1, sem deixar negativo
        stats[r.id].weeksWithoutOff = Math.max(0, stats[r.id].weeksWithoutOff - 1);

        // REGRA 3: só força repetição se a tarefa ainda existir/estiver ativa
        if (tarefaPendente) {
          newAssignments.push({
            residentId: r.id,
            taskId: tarefaPendente.id,
            weight: tarefaPendente.peso
          });

          stats[r.id].totalWeight += tarefaPendente.peso;
          stats[r.id].taskCounts[tarefaPendente.id] =
            (stats[r.id].taskCounts[tarefaPendente.id] || 0) + 1;

          lockedResidentIds.add(r.id);

          console.log(`${r.nome} não concluiu "${tarefaPendente.nome}" — travado na mesma tarefa (penalidade -1 aplicada).`);
        }
      }
    });

    // Remove quem já está travado do pool de decisão normal
    availableResidents = availableResidents.filter(r => !lockedResidentIds.has(r.id));
    availableTasks = availableTasks.filter(
      t => !newAssignments.some(a => a.taskId === t.id)
    );
  }

  // 5. Determinar e Distribuir Folgas (Prioridade Máxima)
  // numOffs considera só quem sobrou (residentes e tarefas livres)
  const numOffs = Math.max(0, availableResidents.length - availableTasks.length);

  if (numOffs > 0) {
    availableResidents.sort((a, b) => {
      const diff = stats[b.id].weeksWithoutOff - stats[a.id].weeksWithoutOff;
      if (diff !== 0) return diff;

      // Empate no tempo sem folga → escolha aleatória
      return Math.random() - 0.5;
    });

    console.log(
      availableResidents.map(r => ({
        nome: r.nome,
        semFolga: stats[r.id].weeksWithoutOff,
        folgas: stats[r.id].totalOffs
      }))
    );

    const offResidents = availableResidents.splice(0, numOffs);
    console.log("Folgas escolhidas:", offResidents.map(r => r.nome));

    offResidents.forEach(r => {
      newAssignments.push({ residentId: r.id, taskId: null, weight: 0 });
    });
  }

  // 6. Ordenar tarefas restantes: da mais pesada para a mais leve
  const sortedTasks = [...availableTasks].sort((a, b) => b.peso - a.peso);

  const TASK_SIDE_REQUIREMENTS: Record<string, 'esquerdo' | 'direito'> = {
    'Banheiro 1': 'direito',
    'Banheiro 2': 'esquerdo',
  };

  // 7. Distribuir Tarefas Baseado no Score de Justiça
  sortedTasks.forEach(task => {
    const requiredSide = TASK_SIDE_REQUIREMENTS[task.nome];

    let candidatos = availableResidents;
    if (requiredSide) {
      const doLadoCerto = availableResidents.filter(r => r.lado === requiredSide);
      if (doLadoCerto.length > 0) {
        candidatos = doLadoCerto;
      } else {
        console.warn(`Nenhum morador do lado "${requiredSide}" disponível para "${task.nome}". Atribuindo sem restrição de lado.`);
      }
    }

    candidatos.sort((a, b) => {
      const statsA = stats[a.id];
      const statsB = stats[b.id];

      const isConsecutiveA = statsA.lastWeekTaskId === task.id;
      const isConsecutiveB = statsB.lastWeekTaskId === task.id;

      if (isConsecutiveA && !isConsecutiveB) return 1;
      if (!isConsecutiveA && isConsecutiveB) return -1;

      const scoreA = ((statsA.taskCounts[task.id] || 0) * 100) + statsA.totalWeight;
      const scoreB = ((statsB.taskCounts[task.id] || 0) * 100) + statsB.totalWeight;

      const diff = scoreA - scoreB;
      return diff !== 0 ? diff : Math.random() - 0.5;
    });

    const selectedResident = candidatos.shift();

    if (selectedResident) {
      availableResidents = availableResidents.filter(r => r.id !== selectedResident.id);

      newAssignments.push({
        residentId: selectedResident.id,
        taskId: task.id,
        weight: task.peso
      });

      stats[selectedResident.id].totalWeight += task.peso;
      stats[selectedResident.id].taskCounts[task.id] =
        (stats[selectedResident.id].taskCounts[task.id] || 0) + 1;
    }
  });

  return newAssignments;
}