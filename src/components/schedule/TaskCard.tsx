export function TaskCard({ taskName, residentName, weight, isCompleted, onToggleComplete }: any) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-gray-900">{taskName}</h3>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Peso {weight}</span>
        </div>
        {isCompleted && <span className="text-emerald-600 font-bold text-sm">✓ Feito</span>}
      </div>
      <p className="text-sm text-gray-600 mb-3">Responsável: <span className="font-semibold">{residentName}</span></p>
      
      {!isCompleted && (
        <button 
          onClick={onToggleComplete}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Marcar Concluída
        </button>
      )}
    </div>
  );
}