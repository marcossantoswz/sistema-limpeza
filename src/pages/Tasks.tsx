import { useState, useEffect } from 'react';
import { useSchedule } from '../hooks/useSchedule';
import { useRanking } from '../hooks/useRanking';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { closeAndGenerateWeek } from '../services/api';
import { supabase } from '../services/supabase'; // <-- Importado para podermos editar direto no banco
import {
  AlertTriangle,
  Coffee,
  CheckCircle2,
  ClipboardList,
  Copy,
  Check,
  Pencil,
  X,
  Save
} from 'lucide-react';

export function Tasks() {
  const { assignments, isLoading, toggleTaskStatus, refetch } = useSchedule();
  const { ranking } = useRanking();
  const { user } = useAuth();

  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados para o Modo de Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('folga');
  const [todasTarefas, setTodasTarefas] = useState<any[]>([]);

  // Carrega a lista de tarefas disponíveis para preencher o dropdown de edição
  useEffect(() => {
    async function fetchTarefas() {
      const { data } = await supabase.from('tarefas').select('*').eq('ativo', true);
      if (data) setTodasTarefas(data);
    }
    fetchTarefas();
  }, []);

  const tarefasDaSemana = assignments.filter(a => a.tarefas !== null);
  const totalTarefas = tarefasDaSemana.length;
  const feitas = tarefasDaSemana.filter(a => a.status === 'concluida').length;
  const progresso = totalTarefas > 0 ? (feitas / totalTarefas) * 100 : 0;

  const pioresMoradores = [...ranking]
    .sort((a, b) => b.tarefas_perdidas - a.tarefas_perdidas)
    .filter(m => m.tarefas_perdidas > 0)
    .slice(0, 2);

  async function handleCloseWeek() {
    if (!window.confirm('Fechar semana e gerar nova escala?')) return;

    const concluidas = assignments.filter(a => a.tarefas !== null && a.status === 'concluida');
    const naoFeitas = assignments.filter(a => a.tarefas !== null && a.status === 'pendente');

    let relatorio = '📋 Semana finalizada (Resumo Gerado Automaticamente): \n\n';
    relatorio += '✅ Fizeram a tarefa:\n';
    relatorio += concluidas.length > 0
      ? concluidas.map(a => `${a.moradores.nome} - ${a.tarefas!.nome}`).join('\n')
      : 'Ninguém';
    relatorio += '\n\n❌ Não fizeram:\n';
    relatorio += naoFeitas.length > 0
      ? naoFeitas.map(a => `${a.moradores.nome} - ${a.tarefas!.nome}`).join('\n')
      : 'Ninguém';

    try {
      await navigator.clipboard.writeText(relatorio);
    } catch {
      console.warn('Não foi possível copiar o relatório automaticamente.');
    }

    setIsClosing(true);
    await closeAndGenerateWeek();
    await refetch();
    setIsClosing(false);
  }

  function handleCopySchedule() {
    const linhas = assignments.map(a => {
      const tarefa = a.tarefas ? a.tarefas.nome : 'Folga';
      return `${a.moradores.nome} - ${tarefa}`;
    });

    const texto = linhas.join('\n');
    navigator.clipboard.writeText(texto).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      alert('Não foi possível copiar. Tente novamente.');
    });
  }

  // Função que salva a nova tarefa escolhida
  async function handleSaveEdit(assignmentId: string) {
    const task = todasTarefas.find(t => t.id === selectedTaskId);
    const taskId = task ? task.id : null;
    const peso = task ? task.peso : 0;

    const { error } = await supabase
      .from('atribuicoes')
      .update({
        tarefa_id: taskId,
        peso_historico: peso,
        status: 'pendente' // Volta para pendente caso a pessoa tivesse marcado folga/tarefa como feita
      })
      .eq('id', assignmentId);

    if (!error) {
      setEditingId(null);
      refetch();
    } else {
      alert('Erro ao atualizar tarefa.');
    }
  }

  if (isLoading) return <Loader size="lg" className="mt-20" />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-6">
      {/* ALERTA */}
      {pioresMoradores.length > 0 && (
        <div className="flex gap-4 items-center p-5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg">
          <div className="p-3 bg-white/20 rounded-xl">
            <AlertTriangle />
          </div>
          <div>
            <h3 className="font-bold text-lg">Atenção na escala</h3>
            <p className="text-sm text-red-100">
              {pioresMoradores.map(m => m.nome).join(' e ')} possuem tarefas pendentes.
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-8 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold">Escala da Semana</h1>
              <p className="text-slate-300 mt-2">Organização das tarefas</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleCopySchedule} className="bg-white/10 text-white hover:bg-white/20 rounded-xl font-bold flex items-center gap-2">
                {copied ? <><Check size={18} /> Copiado!</> : <><Copy size={18} /> Copiar escala</>}
              </Button>
              {user && (
                <Button onClick={handleCloseWeek} isLoading={isClosing} className="bg-emerald-400 text-slate-900 hover:bg-emerald-300 rounded-xl font-bold">
                  Finalizar semana
                </Button>
              )}
            </div>
          </div>

          {/* PROGRESSO */}
          <div className="mt-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Progresso</span>
              <span className="font-bold">{Math.round(progresso)}%</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-300 transition-all duration-700"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TAREFAS */}
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const isEditing = editingId === assignment.id;
          const isFolga = !assignment.tarefas;

          return (
            <div
              key={assignment.id}
              className={`
                group rounded-2xl border p-5 shadow-sm transition hover:shadow-lg
                ${isEditing ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500' : isFolga ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}
              `}
            >
              {isEditing ? (
                // --- MODO DE EDIÇÃO ---
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                  <div className="flex-1 w-full">
                    <p className="text-sm text-gray-500 mb-2">
                      Mudando a tarefa de <span className="font-bold text-gray-900">{assignment.moradores.nome}</span>:
                    </p>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white"
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                    >
                      <option value="folga">☕ Folga (Peso 0)</option>
                      {todasTarefas.map(t => (
                        <option key={t.id} value={t.id}>{t.nome} (Peso {t.peso})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-6">
                    <button 
                      onClick={() => setEditingId(null)} 
                      className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                      title="Cancelar"
                    >
                      <X size={20} />
                    </button>
                    <button 
                      onClick={() => handleSaveEdit(assignment.id)} 
                      className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Save size={18} /> Salvar
                    </button>
                  </div>
                </div>
              ) : (
                // --- MODO NORMAL DE VISUALIZAÇÃO ---
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                  
                  {/* INFORMAÇÕES DA TAREFA / FOLGA */}
                  <div className="flex items-center gap-4">
                    {isFolga ? (
                      <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                        <Coffee />
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <ClipboardList />
                      </div>
                    )}

                    <div>
                      {isFolga ? (
                        <>
                          <h3 className="font-bold text-amber-900">{assignment.moradores.nome}</h3>
                          <p className="text-sm text-amber-700 font-medium mt-0.5">Está de folga ☕</p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-gray-900">{assignment.tarefas?.nome}</h3>
                          <p className="text-sm text-gray-500">{assignment.moradores.nome}</p>
                          <span className="inline-block mt-1 text-xs bg-gray-100 px-2 py-1 rounded-lg">
                            Peso {assignment.peso_historico}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* BOTÕES DE AÇÃO (Visíveis apenas para Admin Logado) */}
                  {user && (
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={() => {
                          setEditingId(assignment.id);
                          setSelectedTaskId(assignment.tarefas ? assignment.tarefas.id : 'folga');
                        }}
                        className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                        title="Trocar Tarefa"
                      >
                        <Pencil size={18} />
                      </button>

                      {!isFolga && (
                        <button
                          onClick={() => toggleTaskStatus(assignment.id, assignment.status)}
                          className={`
                            flex-1 sm:flex-none px-5 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2
                            ${assignment.status === 'concluida' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'}
                          `}
                        >
                          {assignment.status === 'concluida' ? <><CheckCircle2 size={18}/> Feito</> : 'Marcar'}
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}