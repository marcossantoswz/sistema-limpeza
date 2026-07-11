
import { Trophy, Coffee, Target } from 'lucide-react';

interface ResidentRowProps {
  position: number;
  name: string;
  completedTasks: number;
  totalWeight: number;
  offDays: number;
}

export function ResidentRow({ 
  position, 
  name, 
  completedTasks, 
  totalWeight, 
  offDays 
}: ResidentRowProps) {
  const isTopThree = position <= 3;

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
          position === 1 ? 'bg-yellow-100 text-yellow-700' :
          position === 2 ? 'bg-gray-200 text-gray-700' :
          position === 3 ? 'bg-orange-100 text-orange-700' :
          'bg-blue-50 text-blue-600'
        }`}>
          {isTopThree ? <Trophy className="w-4 h-4" /> : position}
        </div>
        <h4 className="font-medium text-gray-900">{name}</h4>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end sm:items-center sm:flex-row gap-1 sm:gap-6">
          <div className="flex items-center gap-1.5 text-sm text-gray-600" title="Tarefas Concluídas">
            <Target className="w-4 h-4 text-green-500" />
            <span className="font-medium">{completedTasks}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600" title="Peso Acumulado">
            <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">
              Pt: {totalWeight}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600" title="Total de Folgas">
            <Coffee className="w-4 h-4 text-orange-400" />
            <span className="font-medium">{offDays}</span>
          </div>
        </div>
      </div>
    </div>
  );
}