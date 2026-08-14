// src/types/index.ts

export type Lado = 'esquerdo' | 'direito';

export interface Resident {
  id: string;
  nome: string;
  ativo: boolean;
  lado: Lado | null;
  peso_inicial: number;
  created_at?: string;
}

export interface Task {
  id: string;
  nome: string;
  peso: number;
  ativo: boolean;
  created_at?: string;
}

export interface Week {
  id: string;
  data_inicio: string;
  data_fim: string;
  status: 'atual' | 'arquivada';
  created_at?: string;
}

export interface Assignment {
  id: string;
  semana_id: string;
  morador_id: string;
  tarefa_id: string | null; // null representa Folga
  peso_historico: number;
  status: 'pendente' | 'concluida';
  created_at?: string;
}

// Tipagem usada para a entrada do Algoritmo (com JOIN da tabela semanas)
// Tipagem usada para a entrada do Algoritmo (com JOIN da tabela semanas)
export interface AssignmentHistory extends Assignment {
  semanas: {
    status: 'atual' | 'arquivada';
    data_inicio: string;
    created_at: string; // <- adiciona essa linha
  };
}

// Tipagem usada no Frontend (Página Home) para exibir os cards
export interface AssignmentDetail {
  id: string;
  status: 'pendente' | 'concluida';
  peso_historico: number;
  moradores: { id: string; nome: string };
  tarefas: { id: string; nome: string } | null;
}