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

type Assignment = { residentId: string; taskId: string | null; weight: number };

const TASK_SIDE_REQUIREMENTS: Record<string, 'esquerdo' | 'direito'> = {
  'Banheiro 1': 'direito',
  'Banheiro 2': 'esquerdo',
};

// ==========================================================
// NOVO — Passo final: corrige repetições evitáveis via troca.
// Só troca tarefa com tarefa (nunca mexe em folga nem em quem
// está travado por pendência — essas repetições são obrigatórias).
// ==========================================================
function resolveAvoidableRepeats(
  assignments: Assignment[],
  stats: Record<string, ResidentStats>,
  tasks: Task[],
  residents: Resident[],
  lockedResidentIds: Set<string>
) {
  const residentById = new Map(residents.map(r => [r.id, r]));
  const taskById = new Map(tasks.map(t => [t.id, t]));

  const swappable = assignments.filter(
    a => a.taskId !== null && !lockedResidentIds.has(a.residentId)
  );

  for (const assignment of swappable) {
    const resident = residentById.get(assignment.residentId);
    if (!resident) continue;

    const isRepeat = stats[assignment.residentId].lastWeekTaskId === assignment.taskId;
    if (!isRepeat) continue;

    for (const other of swappable) {
      if (other === assignment) continue;

      const otherResident = residentById.get(other.residentId);
      if (!otherResident) continue;

      // A troca não pode criar um NOVO repeat pro outro morador
      if (stats[other.residentId].lastWeekTaskId === assignment.taskId) continue;

      const taskA = taskById.get(assignment.taskId!);
      const taskB = taskById.get(other.taskId!);
      if (!taskA || !taskB) continue;

      // Respeita a regra de lado: cada um só assume a tarefa do outro
      // se o lado dele bater com o que a tarefa exige
      const sideA = TASK_SIDE_REQUIREMENTS[taskA.nome];
      const sideB = TASK_SIDE_REQUIREMENTS[taskB.nome];
      if (sideA && otherResident.lado !== sideA) continue;
      if (sideB && resident.lado !== sideB) continue;

      // Troca resolve — aplica
      const tempTaskId = assignment.taskId;
      const tempWeight = assignment.weight;
      assignment.taskId = other.taskId;
      assignment.weight = other.weight;
      other.taskId = tempTaskId;
      other.weight = tempWeight;

      console.log(`Troca aplicada: ${resident.nome} <-> ${otherResident.nome} para evitar repetição de tarefa.`);
      break;
    }
  }
}

export function generateNextWeekSchedule(
  residents: Resident[],
  tasks: Task[],
  history: AssignmentHistory[]
): Assignment[] {

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

  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.semanas.created_at).getTime() - new Date(a.semanas.created_at).getTime()
  );
  const lastWeekId = sortedHistory.length > 0 ? sortedHistory[0].semana_id : null;

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

  let availableResidents = [...residents];
  let availableTasks = [...tasks];
  const newAssignments: Assignment[] = [];
  const lockedResidentIds = new Set<string>();

  if (lastWeekId) {
    residents.forEach(r => {
      const lastWeekRecord = history.find(
        h => h.semana_id === lastWeekId && h.morador_id === r.id
      );

      const naoCompletou =
        lastWeekRecord &&
        lastWeekRecord.tarefa_id !== null &&
        lastWeekRecord.status === 'pendente';

      if (naoCompletou) {
        const tarefaPendente = tasks.find(t => t.id === lastWeekRecord!.tarefa_id);

        stats[r.id].weeksWithoutOff = Math.max(0, stats[r.id].weeksWithoutOff - 2);

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

          console.log(`${r.nome} não concluiu "${tarefaPendente.nome}" — travado na mesma tarefa (penalidade -2 aplicada).`);
        }
      }
    });

    availableResidents = availableResidents.filter(r => !lockedResidentIds.has(r.id));
    availableTasks = availableTasks.filter(
      t => !newAssignments.some(a => a.taskId === t.id)
    );
  }

  const numOffs = Math.max(0, availableResidents.length - availableTasks.length);

  if (numOffs > 0) {
    availableResidents.sort((a, b) => {
      const diff = stats[b.id].weeksWithoutOff - stats[a.id].weeksWithoutOff;
      if (diff !== 0) return diff;
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

  const sortedTasks = [...availableTasks].sort((a, b) => b.peso - a.peso);

  sortedTasks.forEach((task, taskIndex) => {
    const requiredSide = TASK_SIDE_REQUIREMENTS[task.nome];
    let assignedViaRescue = false;

    if (requiredSide) {
      const doLadoCerto = availableResidents.filter(r => r.lado === requiredSide);

      if (doLadoCerto.length === 0) {
        const folgaDoLado = newAssignments
          .filter(a => a.taskId === null)
          .map(a => residents.find(r => r.id === a.residentId))
          .filter((r): r is Resident => !!r && r.lado === requiredSide);

        if (folgaDoLado.length > 0) {
          folgaDoLado.sort((a, b) => {
            const diffFolga = stats[a.id].weeksWithoutOff - stats[b.id].weeksWithoutOff;
            if (diffFolga !== 0) return diffFolga;
            const scoreA = ((stats[a.id].taskCounts[task.id] || 0) * 100) + stats[a.id].totalWeight;
            const scoreB = ((stats[b.id].taskCounts[task.id] || 0) * 100) + stats[b.id].totalWeight;
            const diff = scoreA - scoreB;
            return diff !== 0 ? diff : Math.random() - 0.5;
          });

          const resgatado = folgaDoLado[0];

          const futureTasks = sortedTasks.slice(taskIndex + 1);
          const isCritical = (candidate: Resident) =>
            futureTasks.some(futureTask => {
              const side = TASK_SIDE_REQUIREMENTS[futureTask.nome];
              if (!side || candidate.lado !== side) return false;
              const outrosDoLado = availableResidents.filter(
                r => r.lado === side && r.id !== candidate.id
              );
              return outrosDoLado.length === 0;
            });

          const candidatosParaFolga = availableResidents.filter(r => !isCritical(r));

          if (candidatosParaFolga.length > 0) {
            candidatosParaFolga.sort(
              (a, b) => stats[b.id].weeksWithoutOff - stats[a.id].weeksWithoutOff
            );
            const substituto = candidatosParaFolga[0];

            const idxFolga = newAssignments.findIndex(
              a => a.taskId === null && a.residentId === resgatado.id
            );
            if (idxFolga !== -1) newAssignments.splice(idxFolga, 1);

            newAssignments.push({ residentId: substituto.id, taskId: null, weight: 0 });
            availableResidents = availableResidents.filter(r => r.id !== substituto.id);

            newAssignments.push({
              residentId: resgatado.id,
              taskId: task.id,
              weight: task.peso
            });
            stats[resgatado.id].totalWeight += task.peso;
            stats[resgatado.id].taskCounts[task.id] =
              (stats[resgatado.id].taskCounts[task.id] || 0) + 1;

            console.warn(
              `Ninguém do lado "${requiredSide}" disponível para "${task.nome}" — ` +
              `${resgatado.nome} saiu da folga para cobrir a tarefa, e ` +
              `${substituto.nome} entrou de folga no lugar dele(a).`
            );

            assignedViaRescue = true;
          } else {
            console.warn(
              `Nenhum morador do lado "${requiredSide}" disponível para "${task.nome}", ` +
              `sem substituto seguro pra folga. Atribuindo sem restrição de lado.`
            );
          }
        } else {
          console.warn(`Nenhum morador do lado "${requiredSide}" disponível para "${task.nome}" (nem entre quem tirou folga). Atribuindo sem restrição de lado.`);
        }
      }
    }

    if (assignedViaRescue) return;

    let candidatos = availableResidents;
    if (requiredSide) {
      const doLadoCerto = availableResidents.filter(r => r.lado === requiredSide);
      if (doLadoCerto.length > 0) candidatos = doLadoCerto;
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

  // PASSO FINAL: tenta corrigir repetições evitáveis via troca
  resolveAvoidableRepeats(newAssignments, stats, tasks, residents, lockedResidentIds);

  return newAssignments;
}