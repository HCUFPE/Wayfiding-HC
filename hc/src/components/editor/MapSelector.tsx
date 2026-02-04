// src/components/editor/MapSelector.tsx

import { useState, useRef } from 'react';
import type { GeoJSONData } from '../../types/navigation';
import { getBaseFeatures } from '../../services/geoJsonService';
import { MdUploadFile, MdMap } from 'react-icons/md';

interface MapSelectorProps {
  onSelectMap: (geojson: GeoJSONData, name: string) => void;
  currentMapName?: string;
}

/**
 * Componente para upload e seleção de mapas GeoJSON
 */
export function MapSelector({ onSelectMap, currentMapName }: MapSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data?.features) {
        throw new Error('Arquivo GeoJSON inválido');
      }

      const baseGeoJSON = getBaseFeatures(data);
      onSelectMap(baseGeoJSON, file.name);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFloor = async () => {
    setLoading(true);
    setError(null);

    try {
      const fileName = `mapa_andar${selectedFloor}.geojson`;
      const response = await fetch(`/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`Arquivo ${fileName} não encontrado`);
      }

      const data = await response.json();
      const baseGeoJSON = getBaseFeatures(data);
      onSelectMap(baseGeoJSON, fileName);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar andar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Selecionar Mapa</h3>

      {/* Seletor de Andar */}
      <div className="space-y-2">
        <label className="text-xs text-slate-600 font-medium">Selecione o Andar:</label>
        <div className="flex gap-2">
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(floor => (
              <option key={floor} value={floor}>{floor}º Andar</option>
            ))}
          </select>
          
          <button
            onClick={handleLoadFloor}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-semibold text-sm transition active:scale-95"
          >
            {loading ? '...' : 'Carregar'}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Carrega: mapa_andar{selectedFloor}.geojson
        </p>
      </div>

      <div className="border-t border-slate-300 pt-3">
        <p className="text-xs text-slate-600 mb-2">Ou faça upload:</p>
        
        {/* Botão de upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition active:scale-95"
        >
          <MdUploadFile className="w-5 h-5" />
          {loading ? 'Carregando...' : 'Upload GeoJSON'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".geojson,.json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Mapa atual */}
      {currentMapName && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xs font-semibold text-green-800 mb-1">
            ✓ Mapa Ativo
          </div>
          <div className="text-sm text-green-700 font-mono truncate">
            {currentMapName}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs font-semibold text-red-800 mb-1">
            ⚠️ Erro
          </div>
          <div className="text-sm text-red-700">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
