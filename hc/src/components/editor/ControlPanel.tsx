import type { EditorMode } from '../../types/navigation';
import { MdSave, MdDeleteForever } from 'react-icons/md';

interface ControlPanelProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  nodeCount: number;
  edgeCount: number;
  onSave: () => void;
  onClear: () => void;
}

/**
 * Painel de controles do editor
 */
export function ControlPanel({
  mode,
  setMode,
  nodeCount,
  edgeCount,
  onSave,
  onClear
}: ControlPanelProps) {
  const modes: { value: EditorMode; label: string }[] = [
    { value: 'add-node', label: 'Adicionar Nó' },
    { value: 'add-edge', label: 'Adicionar Aresta' },
    { value: 'name-node', label: 'Nomear Nó' },
    { value: 'instruction-node', label: 'Dar Instrução' },
    { value: 'delete', label: 'Apagar' },
    { value: 'view', label: 'Visualizar/Testar Rota' }
  ];

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-xl p-4 max-w-xs">
      
      {/* Seletor de modo */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Modo de Edição
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as EditorMode)}
          className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-medium"
        >
          {modes.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition active:scale-95"
        >
          <MdSave className="w-4 h-4" />
          Salvar
        </button>

        <button
          onClick={onClear}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition active:scale-95"
        >
          <MdDeleteForever className="w-4 h-4" />
          Limpar
        </button>
      </div>

      {/* Estatísticas */}
      <div className="p-3 bg-slate-50 rounded-lg">
        <div className="text-xs font-semibold text-slate-600 mb-2">
          Estatísticas
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Nós:</span>
            <span className="font-bold text-slate-800">{nodeCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Arestas:</span>
            <span className="font-bold text-slate-800">{edgeCount}</span>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="text-xs font-semibold text-blue-800 mb-1">
          💡 Como usar
        </div>
        <div className="text-xs text-blue-700">
          {mode === 'add-node' && 'Clique no mapa para adicionar nós'}
          {mode === 'add-edge' && 'Clique em 2 nós para conectá-los'}
          {mode === 'name-node' && 'Clique em um nó para nomeá-lo'}
          {mode === 'instruction-node' && 'Clique em um nó para adicionar instrução'}
          {mode === 'delete' && 'Clique em nós ou arestas para apagar'}
          {mode === 'view' && 'Clique em 2 nós para ver a rota entre eles'}
        </div>
      </div>
    </div>
  );
}
