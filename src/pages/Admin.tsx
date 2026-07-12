// src/pages/Admin.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useResidents } from '../hooks/useResidents';
import { useTasks } from '../hooks/useTasks';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../services/supabase';
import type { Resident, Task } from '../types';
import { Button } from '../components/ui/Button';
import {
  Users,
  ClipboardList,
  UserPlus,
  Plus,
  Edit3,
  Trash2,
  LogOut,
  Settings
} from 'lucide-react';

export function Admin() {
  const { signOut } = useAuth();
  
  const { residents, isLoading: loadingResidents, refetch: refetchResidents } = useResidents();
  const { tasks, isLoading: loadingTasks, refetch: refetchTasks } = useTasks();
  
  // ==========================================
  // ESTADOS: MORADORES
  // ==========================================
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [residentSide, setResidentSide] = useState<'esquerdo' | 'direito'>('esquerdo');
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
    setResidentSide(resident.lado ?? 'esquerdo');
  } else {
    setEditingResident(null);
    setResidentName('');
    setResidentSide('esquerdo');
  }
  setIsResidentModalOpen(true);
};

  const handleSaveResident = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!residentName.trim()) return;
  
  setIsSubmittingResident(true);
  try {
    if (editingResident) {
      const { error } = await supabase.from('moradores')
        .update({ nome: residentName.trim(), lado: residentSide })
        .eq('id', editingResident.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('moradores')
        .insert([{ nome: residentName.trim(), ativo: true, lado: residentSide }]);
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
        <div className="max-w-6xl mx-auto space-y-8">


        {/* HEADER */}

        <section
        className="
        relative
        overflow-hidden
        rounded-3xl
        bg-gradient-to-br
        from-slate-900
        via-blue-950
        to-indigo-900
        p-8
        text-white
        shadow-xl
        "
        >

        <div
        className="
        absolute
        -right-20
        -top-20
        w-72
        h-72
        bg-blue-500/20
        rounded-full
        blur-3xl
        "
        />


        <div className="
        relative
        flex
        flex-col
        md:flex-row
        md:items-center
        justify-between
        gap-6
        ">


        <div>

        <div className="
        flex
        items-center
        gap-3
        mb-3
        ">

        <div className="
        p-3
        bg-white/10
        rounded-2xl
        ">

        <Settings/>

        </div>


        <h1 className="
        text-3xl
        font-bold
        ">
        Painel Administrativo
        </h1>

        </div>


        <p className="
        text-slate-300
        ">
        Gerencie moradores, tarefas e regras da escala.
        </p>


        </div>


        <Button
        onClick={signOut}
        variant="secondary"
        className="
        flex
        items-center
        gap-2
        rounded-xl
        "
        >

        <LogOut size={18}/>

        Sair

        </Button>


        </div>

        </section>





        {/* RESUMO */}

        <div className="
        grid
        sm:grid-cols-2
        gap-5
        ">


        <div
        className="
        bg-white
        rounded-2xl
        border
        border-gray-100
        p-5
        shadow-sm
        flex
        items-center
        gap-4
        "
        >

        <div className="
        p-4
        rounded-2xl
        bg-blue-50
        text-blue-600
        ">

        <Users/>

        </div>


        <div>

        <p className="
        text-sm
        text-gray-500
        ">
        Moradores
        </p>

        <h2 className="
        text-3xl
        font-bold
        text-gray-900
        ">
        {residents.length}
        </h2>

        </div>


        </div>



        <div
        className="
        bg-white
        rounded-2xl
        border
        border-gray-100
        p-5
        shadow-sm
        flex
        items-center
        gap-4
        "
        >

        <div className="
        p-4
        rounded-2xl
        bg-emerald-50
        text-emerald-600
        ">

        <ClipboardList/>

        </div>


        <div>

        <p className="
        text-sm
        text-gray-500
        ">
        Tarefas cadastradas
        </p>


        <h2 className="
        text-3xl
        font-bold
        text-gray-900
        ">
        {tasks.length}
        </h2>

        </div>


        </div>


        </div>





        {/* LISTAS */}

        <div
        className="
        grid
        lg:grid-cols-2
        gap-8
        "
        >


        {/* MORADORES */}

        <section
        className="
        bg-white
        rounded-3xl
        border
        border-gray-100
        shadow-sm
        p-6
        "
        >


        <div className="
        flex
        justify-between
        items-center
        mb-6
        ">


        <div>

        <h2 className="
        text-xl
        font-bold
        text-gray-900
        ">
        Moradores
        </h2>


        <p className="
        text-sm
        text-gray-500
        ">
        Gerencie os participantes
        </p>


        </div>



        <Button
        onClick={() => openResidentModal()}
        className="
        flex
        items-center
        gap-2
        rounded-xl
        "
        >

        <UserPlus size={18}/>

        Adicionar

        </Button>



        </div>





        <div className="space-y-3">


        {
        residents.map(resident=>(

        <div
        key={resident.id}
        className="
        flex
        items-center
        justify-between
        p-4
        rounded-2xl
        bg-gray-50
        hover:bg-gray-100
        transition
        "
        >


        <div className="font-semibold text-gray-800">
            {resident.nome}
            <span className="ml-2 text-xs font-normal text-gray-400">
                ({resident.lado === 'esquerdo' ? 'Esquerdo' : 'Direito'})
            </span>
        </div>

        <div className="
        flex
        gap-2
        ">


        <button
        onClick={() => openResidentModal(resident)}
        className="
        p-2
        rounded-lg
        text-blue-600
        hover:bg-blue-100
        "
        >

        <Edit3 size={17}/>

        </button>



        <button
        onClick={() =>
        handleRemoveResident(
        resident.id,
        resident.nome
        )
        }
        className="
        p-2
        rounded-lg
        text-red-600
        hover:bg-red-100
        "
        >

        <Trash2 size={17}/>

        </button>


        </div>


        </div>

        ))

        }


        </div>


        </section>


        {/* TAREFAS */}

        <section
        className="
        bg-white
        rounded-3xl
        border
        border-gray-100
        shadow-sm
        p-6
        "
        >


        <div className="
        flex
        justify-between
        items-center
        mb-6
        ">


        <div>

        <h2 className="
        text-xl
        font-bold
        text-gray-900
        ">
        Tarefas Base
        </h2>


        <p className="
        text-sm
        text-gray-500
        ">
        Controle dos pesos da escala
        </p>


        </div>



        <Button
        onClick={() => openTaskModal()}
        className="
        flex
        items-center
        gap-2
        rounded-xl
        "
        >

        <Plus size={18}/>

        Adicionar

        </Button>



        </div>




        <div className="space-y-3">


        {
        tasks.map(task=>(


        <div
        key={task.id}
        className="
        flex
        items-center
        justify-between
        p-4
        rounded-2xl
        bg-gray-50
        hover:bg-gray-100
        transition
        "
        >


        <div>

        <div className="
        font-semibold
        text-gray-800
        ">
        {task.nome}
        </div>


        <span
        className="
        inline-block
        mt-1
        px-3
        py-1
        rounded-full
        text-xs
        bg-blue-100
        text-blue-700
        font-semibold
        "
        >

        Peso {task.peso}

        </span>


        </div>

        

        <div className="flex gap-2">


        <button
        onClick={() => openTaskModal(task)}
        className="
        p-2
        rounded-lg
        text-blue-600
        hover:bg-blue-100
        "
        >

        <Edit3 size={17}/>

        </button>



        <button
        onClick={() =>
        handleRemoveTask(
        task.id,
        task.nome
        )
        }
        className="
        p-2
        rounded-lg
        text-red-600
        hover:bg-red-100
        "
        >

        <Trash2 size={17}/>

        </button>


        </div>



        </div>


        ))

        }


        </div>


        </section>



        </div>



        {/* seus Modais continuam exatamente iguais aqui */}
        {/* MODAL MORADOR */}

<Modal
  isOpen={isResidentModalOpen}
  onClose={() => setIsResidentModalOpen(false)}
  title={
    editingResident
      ? "Editar Morador"
      : "Adicionar Morador"
  }
>

<form
  onSubmit={handleSaveResident}
  className="space-y-4"
>

  <div>
    <label className="block text-sm font-medium mb-1">
      Nome do morador
    </label>
    <input
      type="text"
      value={residentName}
      onChange={(e)=>setResidentName(e.target.value)}
      placeholder="Ex: Marcos"
      className="
        w-full
        px-4
        py-3
        rounded-xl
        border
        focus:ring-2
        focus:ring-blue-500
        outline-none
      "
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">
      Lado
    </label>
    <select
      value={residentSide}
      onChange={(e) => setResidentSide(e.target.value as 'esquerdo' | 'direito')}
      className="
        w-full
        px-4
        py-3
        rounded-xl
        border
        focus:ring-2
        focus:ring-blue-500
        outline-none
      "
    >
      <option value="esquerdo">Esquerdo</option>
      <option value="direito">Direito</option>
    </select>
  </div>

  <div className="flex justify-end gap-3">
    <Button
      type="button"
      variant="secondary"
      onClick={()=>setIsResidentModalOpen(false)}
    >
      Cancelar
    </Button>

    <Button
      type="submit"
      isLoading={isSubmittingResident}
    >
      Salvar
    </Button>
  </div>

</form>
  

</Modal>
  {/* MODAL TAREFA */}

<Modal
  isOpen={isTaskModalOpen}
  onClose={() => setIsTaskModalOpen(false)}
  title={
    editingTask
      ? "Editar Tarefa"
      : "Adicionar Tarefa"
  }
>

  <form
    onSubmit={handleSaveTask}
    className="space-y-4"
  >

    <div>
      <label className="block text-sm font-medium mb-1">
        Nome da tarefa
      </label>
      <input
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Ex: Limpar geladeira"
        className="
          w-full
          px-4
          py-3
          rounded-xl
          border
          focus:ring-2
          focus:ring-blue-500
          outline-none
        "
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Peso
      </label>
      <input
        type="number"
        min="1"
        max="10"
        value={taskWeight}
        onChange={(e) => setTaskWeight(Number(e.target.value))}
        className="
          w-full
          px-4
          py-3
          rounded-xl
          border
          focus:ring-2
          focus:ring-blue-500
          outline-none
        "
      />
    </div>

    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsTaskModalOpen(false)}
      >
        Cancelar
      </Button>

      <Button
        type="submit"
        isLoading={isSubmittingTask}
      >
        Salvar
      </Button>
    </div>

  </form>

</Modal>

        </div>
        );
}