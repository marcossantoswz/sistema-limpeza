// src/pages/Admin.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResidents } from '../hooks/useResidents';
import { useTasks } from '../hooks/useTasks';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../services/supabase';
import type { Resident, Task } from '../types';

export function Admin() {
  const { signOut } = useAuth();
  
  const { residents, isLoading: loadingResidents, refetch: refetchResidents } = useResidents();
  const { tasks, isLoading: loadingTasks, refetch: refetchTasks } = useTasks();
  
  // ==========================================
  // ESTADOS: MORADORES
  // ==========================================
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [residentName, setResidentName] = useState('');
  const [isSubmittingResident, setIsSubmittingResident] = useState(false);

  // ==========================================
  // ESTADOS: TAREFAS
  // ==========================================
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskWeight, setTaskWeight] = useState(1);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // ==========================================
  // FUNÇÕES: MORADORES (CRIAR, EDITAR, REMOVER)
  // ==========================================
  const openResidentModal = (resident?: Resident) => {
    if (resident) {
      setEditingResident(resident);
      setResidentName(resident.nome);
    } else {
      setEditingResident(null);
      setResidentName('');
    }
    setIsResidentModalOpen(true);
  };

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentName.trim()) return;
    
    setIsSubmittingResident(true);
    try {
      if (editingResident) {
        // Atualizar existente
        const { error } = await supabase.from('moradores')
          .update({ nome: residentName.trim() })
          .eq('id', editingResident.id);
        if (error) throw error;
      } else {
        // Criar novo
        const { error } = await supabase.from('moradores')
          .insert([{ nome: residentName.trim(), ativo: true }]);
        if (error) throw error;
      }

      setIsResidentModalOpen(false);
      refetchResidents(); 
    } catch (error) {
      console.error('Erro ao salvar morador:', error);
      alert('Erro ao salvar o morador.');
    } finally {
      setIsSubmittingResident(false);
    }
  };

  const handleRemoveResident = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja remover "${nome}"? O histórico será mantido.`)) return;
    
    try {
      // Soft Delete: Apenas inativa o morador para não quebrar o histórico
      const { error } = await supabase.from('moradores').update({ ativo: false }).eq('id', id);
      if (error) throw error;
      refetchResidents();
    } catch (error) {
      console.error('Erro ao remover morador:', error);
      alert('Erro ao remover o morador.');
    }
  };

  // ==========================================
  // FUNÇÕES: TAREFAS (CRIAR, EDITAR, REMOVER)
  // ==========================================
  const openTaskModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskName(task.nome);
      setTaskWeight(task.peso);
    } else {
      setEditingTask(null);
      setTaskName('');
      setTaskWeight(1);
    }
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    
    setIsSubmittingTask(true);
    try {
      if (editingTask) {
        // Atualizar existente
        const { error } = await supabase.from('tarefas')
          .update({ nome: taskName.trim(), peso: taskWeight })
          .eq('id', editingTask.id);
        if (error) throw error;
      } else {
        // Criar nova
        const { error } = await supabase.from('tarefas')
          .insert([{ nome: taskName.trim(), peso: taskWeight, ativo: true }]);
        if (error) throw error;
      }

      setIsTaskModalOpen(false);
      refetchTasks(); 
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar a tarefa.');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleRemoveTask = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja remover a tarefa "${nome}"?`)) return;
    
    try {
      // Soft Delete
      const { error } = await supabase.from('tarefas').update({ ativo: false }).eq('id', id);
      if (error) throw error;
      refetchTasks();
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
      alert('Erro ao remover a tarefa.');
    }
  };

  if (loadingResidents || loadingTasks) return <Loader size="lg" className="mt-20" />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie moradores, tarefas e pesos.</p>
        </div>
        <Button onClick={signOut} variant="secondary">Sair do Sistema</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ========================================== */}
        {/* SEÇÃO: MORADORES                           */}
        {/* ========================================== */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Moradores</h2>
            <Button onClick={() => openResidentModal()} variant="primary" className="text-sm px-3 py-1.5">
              + Adicionar
            </Button>
          </div>
          <ul className="divide-y divide-gray-100">
            {residents.map((resident) => (
              <li key={resident.id} className="py-3 flex justify-between items-center group">
                <span className="font-medium text-gray-700">{resident.nome}</span>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openResidentModal(resident)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                  <button onClick={() => handleRemoveResident(resident.id, resident.nome)} className="text-sm text-red-600 hover:text-red-800 font-medium">Remover</button>
                </div>
              </li>
            ))}
            {residents.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">Nenhum morador cadastrado.</p>}
          </ul>
        </section>

        {/* ========================================== */}
        {/* SEÇÃO: TAREFAS                             */}
        {/* ========================================== */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Tarefas Base</h2>
            <Button onClick={() => openTaskModal()} variant="primary" className="text-sm px-3 py-1.5">
              + Adicionar
            </Button>
          </div>
          <ul className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <li key={task.id} className="py-3 flex justify-between items-center group">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{task.nome}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                    Peso {task.peso}
                  </span>
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openTaskModal(task)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                  <button onClick={() => handleRemoveTask(task.id, task.nome)} className="text-sm text-red-600 hover:text-red-800 font-medium">Remover</button>
                </div>
              </li>
            ))}
            {tasks.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">Nenhuma tarefa cadastrada.</p>}
          </ul>
        </section>
      </div>

      {/* ========================================== */}
      {/* MODAL: MORADOR                             */}
      {/* ========================================== */}
      <Modal isOpen={isResidentModalOpen} onClose={() => setIsResidentModalOpen(false)} title={editingResident ? "Editar Morador" : "Adicionar Novo Morador"}>
        <form onSubmit={handleSaveResident} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Morador</label>
            <input
              type="text"
              value={residentName}
              onChange={(e) => setResidentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: João Silva"
              required autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsResidentModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingResident}>Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* ========================================== */}
      {/* MODAL: TAREFA                              */}
      {/* ========================================== */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={editingTask ? "Editar Tarefa" : "Adicionar Nova Tarefa"}>
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Tarefa</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Limpar Geladeira"
              required autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso da Tarefa (Esforço)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={taskWeight}
              onChange={(e) => setTaskWeight(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsTaskModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingTask}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}