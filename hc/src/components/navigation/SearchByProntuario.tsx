import { useState } from 'react';
import { MdSearch, MdBackspace } from 'react-icons/md';
import { buscarPaciente, findMatchingLocation } from '../../services/apiService';
import type { NamedNodesMap, Paciente } from '../../types/navigation';
import { ConsultaSelectionModal } from './ConsultaSelectionModal';

interface SearchByProntuarioProps {
  namedNodes: NamedNodesMap;
  onSuccess: (locationName: string) => void;
}

/**
 * Componente de busca por número de prontuário
 */
export function SearchByProntuario({ namedNodes, onSuccess }: SearchByProntuarioProps) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultas, setConsultas] = useState<Paciente[] | null>(null);

  const handleConsultaSelect = (consulta: Paciente) => {
    const destinoRaw = consulta['Local/Consultório'];

    console.log('🏥 Consulta selecionada:', consulta);
    console.log('📍 Destino:', destinoRaw);

    const location = findMatchingLocation(destinoRaw, namedNodes);

    if (!location) {
      setError(`Local "${destinoRaw}" não encontrado no mapa`);
      setConsultas(null);
      return;
    }

    setConsultas(null);
    onSuccess(location.name);
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setError('Digite o número do prontuário');
      return;
    }

    setLoading(true);
    setError(null);
    setConsultas(null);

    try {
      
      const resultado = await buscarPaciente(search);
      

      const consultasArray = Array.isArray(resultado) ? resultado : [resultado];

      const consultasValidas = consultasArray.filter(c => {
        const local = c['Local/Consultório'];
        return local && local.trim() !== '' && local !== '(null)';
      });

      if (consultasValidas.length === 0) {
        throw new Error('Nenhuma consulta com local/consultório definido');
      }


      if (consultasValidas.length === 1) {
        console.log('📍 Apenas 1 consulta, navegando diretamente');
        handleConsultaSelect(consultasValidas[0]);
        return;
      }

      setConsultas(consultasValidas);

    } catch (err: any) {
      setError(err.message || 'Erro ao buscar paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = (num: string) => {
    if (search.length < 10) {
      setSearch(prev => prev + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setSearch(prev => prev.slice(0, -1));
    setError(null);
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Layout dividido */}
          <div className="flex gap-8">
            
            {/* Lado esquerdo: Input e botão */}
            <div className="flex-1 flex flex-col justify-center">
              
              {/* Display do número */}
              <div
                className={`flex items-center gap-2 mb-6 border-2 rounded-xl px-6 py-5 transition-colors ${
                  error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="flex-1 text-4xl font-mono tracking-widest text-slate-800 h-12 flex items-center justify-center">
                  {search || <span className="opacity-20 text-slate-400">00000</span>}
                </span>
              </div>

              {/* Botão consultar */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`w-full py-5 rounded-xl font-bold text-lg shadow-lg mb-6 flex items-center justify-center gap-2 transition ${
                  loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 active:scale-95'
                } text-white`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <MdSearch className="w-6 h-6" />
                    CONSULTAR
                  </>
                )}
              </button>

              {/* Mensagem de erro */}
              {error && (
                <div className="bg-red-50 rounded-xl p-4 text-red-600 text-center font-medium border border-red-100">
                  {error}
                </div>
              )}
            </div>

            {/* Lado direito: Teclado numérico */}
            <div className="w-72 bg-slate-50 rounded-xl p-4 grid grid-cols-3 gap-3 content-center border border-slate-100">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  className="h-16 bg-white rounded-lg shadow-sm border border-slate-200 text-2xl font-bold text-slate-700 hover:bg-slate-100 hover:shadow-md transition active:scale-95"
                >
                  {num}
                </button>
              ))}

              <div className="col-start-2">
                <button
                  onClick={() => handleNumberClick('0')}
                  className="w-full h-16 bg-white rounded-lg shadow-sm border border-slate-200 text-2xl font-bold text-slate-700 hover:bg-slate-100 hover:shadow-md transition active:scale-95"
                >
                  0
                </button>
              </div>

              <button
                onClick={handleBackspace}
                className="h-16 bg-red-50 rounded-lg border border-red-100 text-red-500 flex items-center justify-center hover:bg-red-100 hover:shadow-md transition active:scale-95"
              >
                <MdBackspace className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Consultas */}
      {consultas && (
        <ConsultaSelectionModal
          consultas={consultas}
          onSelect={handleConsultaSelect}
          onClose={() => setConsultas(null)}
        />
      )}
    </>
  );
}
