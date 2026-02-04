import { useState, useMemo } from 'react';
import type { NamedNodesMap } from '../../types/navigation';
import { MdSearch, MdLocationOn } from 'react-icons/md';

interface SearchByListProps {
  namedNodes: NamedNodesMap;
  onSelect: (locationName: string) => void;
}

/**
 * Componente de busca por lista de locais
 */
export function SearchByList({ namedNodes, onSelect }: SearchByListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Lista de locais únicos (remove duplicatas)
  const locations = useMemo(() => {
    const uniqueNames = new Set(Object.values(namedNodes));
    return Array.from(uniqueNames)
      .filter(name => name !== 'Você está aqui') // Remove ponto de partida
      .sort();
  }, [namedNodes]);

  // Filtra locais baseado no termo de busca
  const filteredLocations = useMemo(() => {
    if (!searchTerm.trim()) return locations;

    const term = searchTerm.toLowerCase();
    return locations.filter(name =>
      name.toLowerCase().includes(term)
    );
  }, [locations, searchTerm]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Campo de busca */}
      <div className="relative mb-4">
        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite para filtrar locais..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-lg transition"
        />
      </div>

      {/* Lista de locais */}
      <div className="bg-white rounded-xl shadow-lg max-h-[60vh] overflow-y-auto">
        {filteredLocations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchTerm ? 'Nenhum local encontrado' : 'Nenhum local disponível'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLocations.map((name, index) => (
              <button
                key={index}
                onClick={() => onSelect(name)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-blue-50 transition text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition">
                  <MdLocationOn className="text-blue-600 w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                    {name}
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-blue-600 transition">
                  →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contador */}
      {filteredLocations.length > 0 && (
        <div className="mt-3 text-center text-sm text-slate-500">
          {filteredLocations.length} {filteredLocations.length === 1 ? 'local disponível' : 'locais disponíveis'}
        </div>
      )}
    </div>
  );
}
