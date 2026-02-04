// src/pages/EditorPage.tsx

import { useState } from 'react';
import { useGraphEditor } from '../hooks/useGraphEditor';
import type { GeoJSONData } from '../types/navigation';
import { LeafletMap } from '../components/map/LeafletMap';
import { MapNodes } from '../components/map/MapNodes';
import { MapEdges } from '../components/map/MapEdges';
import { MapRoute } from '../components/map/MapRoute';
import { MapClickHandler } from '../components/map/MapClickHandler';
import { ControlPanel } from '../components/editor/ControlPanel';
import { MapSelector } from '../components/editor/MapSelector';

export function EditorPage() {
  const [baseGeoJSON, setBaseGeoJSON] = useState<GeoJSONData | null>(null);
  const [currentMapName, setCurrentMapName] = useState('');
  const [currentFloor, setCurrentFloor] = useState<number>(1);

  const {
    nodes,
    edges,
    named,
    instructions,
    route,
    mode,
    setMode,
    handleMapClick,
    saveMap,
    clearGraph,
    setNodes,
    setEdges,
    setNamed,
    setInstructions,
    setRoute
  } = useGraphEditor(baseGeoJSON);

  const handleSelectMap = async (geojson: GeoJSONData, name: string) => {
    setBaseGeoJSON(geojson);
    setCurrentMapName(name);

    // Extrai número do andar do nome do arquivo
    const floorMatch = name.match(/andar(\d+)/i);
    if (floorMatch) {
      setCurrentFloor(parseInt(floorMatch[1]));
    }

    // IMPORTANTE: Carrega nós existentes se o arquivo já tiver dados de navegação
    try {
      // Tenta carregar o arquivo completo (não só base)
      const fullData = await fetch(`/${name}`).then(r => r.json());
      
      const navNodes: NodesMap = {};
      const navNamed: NamedNodesMap = {};
      const navInstructions: InstructionsMap = {};
      const navEdges: Edge[] = [];

      for (const feature of fullData.features) {
        if (feature.geometry?.type === 'Point' && feature.properties?.type === 'nav_node') {
          const key = feature.properties.id;
          navNodes[key] = feature.geometry.coordinates;
          if (feature.properties.name) {
            navNamed[key] = feature.properties.name;
          }
          if (feature.properties.instruction) {
            navInstructions[key] = feature.properties.instruction;
          }
        }
        
        if (feature.geometry?.type === 'LineString' && feature.properties?.type === 'nav_edge') {
          if (feature.geometry.coordinates.length === 2) {
            navEdges.push(feature.geometry.coordinates as Edge);
          }
        }
      }

      // Carrega nós existentes
      if (Object.keys(navNodes).length > 0) {
        setNodes(navNodes);
        setNamed(navNamed);
        setInstructions(navInstructions);
        setEdges(navEdges);
        console.log(`✅ Carregados ${Object.keys(navNodes).length} nós existentes do arquivo`);
      } else {
        // Arquivo novo sem dados, limpa
        setNodes({});
        setEdges([]);
        setNamed({});
        setInstructions({});
        setRoute([]);
      }
    } catch (err) {
      console.warn('Não foi possível carregar dados existentes:', err);
      // Se falhar, apenas limpa
      setNodes({});
      setEdges([]);
      setNamed({});
      setInstructions({});
      setRoute([]);
    }
  };

  return (
    <div className="h-screen w-screen flex">
      
      {/* Painel lateral esquerdo */}
      <div className="w-80 bg-slate-800 text-white p-6 overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
          🛠️ Editor de Grafos Indoor
        </h2>

        <MapSelector
          onSelectMap={handleSelectMap}
          currentMapName={currentMapName}
        />

        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
          <div className="text-sm text-slate-300 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">1.</span>
              <span>Carregue um mapa GeoJSON</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">2.</span>
              <span>Adicione nós clicando no mapa</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">3.</span>
              <span>Conecte nós com arestas</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">4.</span>
              <span>Nomeie pontos importantes</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">5.</span>
              <span>Adicione instruções personalizadas</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">6.</span>
              <span>Teste rotas no modo "Visualizar"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">7.</span>
              <span>Salve o mapa completo</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-900 rounded-lg">
          <div className="text-xs font-semibold text-blue-200 mb-2">
            💡 Dicas
          </div>
          <ul className="text-sm text-blue-100 space-y-1">
            <li>• Nós verdes = nomeados</li>
            <li>• Nós laranjas = sem nome</li>
            <li>• Modo "View" = teste rotas</li>
            <li>• Sempre salve após editar!</li>
          </ul>
        </div>
      </div>

      {/* Área do mapa */}
      <div className="flex-1 relative">
        {baseGeoJSON ? (
          <>
            <ControlPanel
              mode={mode}
              setMode={setMode}
              nodeCount={Object.keys(nodes).length}
              edgeCount={edges.length}
              onSave={() => saveMap(currentFloor)}
              onClear={clearGraph}
            />

            <LeafletMap baseGeoJSON={baseGeoJSON}>
              <MapEdges edges={edges} />
              <MapNodes nodes={nodes} namedNodes={named} />
              <MapRoute route={route} />
              <MapClickHandler mode={mode} onMapClick={handleMapClick} />
            </LeafletMap>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Nenhum mapa carregado
              </h3>
              <p className="text-slate-400">
                Selecione um mapa ao lado para começar a editar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
