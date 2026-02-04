// src/pages/NavigationPage.tsx

import { useState, useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { loadGeoJSON, parseNavigationFromGeoJSON } from '../services/geoJsonService';
import { LeafletMap } from '../components/map/LeafletMap';
import { MapNodes } from '../components/map/MapNodes';
import { MapEdges } from '../components/map/MapEdges';
import { MapRoute } from '../components/map/MapRoute';
import { CenterOnNode } from '../components/map/CenterOnNode';
import { PathInstructions } from '../components/navigation/PathInstructions';
import { SearchByList } from '../components/navigation/SearchByList';
import { SearchByProntuario } from '../components/navigation/SearchByProntuario';
import { roundKey, keyToCoordinate } from '../services/graphService';
import { normalizeText } from '../services/apiService';
import { MdArrowBack } from 'react-icons/md';

interface NavigationPageProps {
  onBack: () => void;
}

export function NavigationPage({ onBack }: NavigationPageProps) {
  const [searchMode, setSearchMode] = useState<'lista' | 'prontuario'>('prontuario');
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [startNodePosition, setStartNodePosition] = useState<[number, number] | null>(null);
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [availableFloors, setAvailableFloors] = useState<number[]>([]);

  const {
    baseGeoJSON,
    nodes,
    namedNodes,
    nodeInstructions,
    edges,
    route,
    error,
    setBaseGeoJSON,
    setNodes,
    setNamedNodes,
    setNodeInstructions,
    setEdges,
    calculateRoute,
    clearRoute,
    setError
  } = useNavigation();

  // Carrega TODOS os andares e mescla os dados
  useEffect(() => {
    const loadAllFloors = async () => {
      const allNodes: NodesMap = {};
      const allNamedNodes: NamedNodesMap = {};
      const allInstructions: InstructionsMap = {};
      const allEdges: Edge[] = [];
      const floorsFound: number[] = [];
      let firstFloorGeoJSON: GeoJSONData | null = null;

      // Tenta carregar andares de 1 a 10
      for (let floor = 1; floor <= 10; floor++) {
        try {
          const data = await loadGeoJSON(`/mapa_andar${floor}.geojson`);
          
          // Se é o primeiro andar, usa como baseGeoJSON
          if (!firstFloorGeoJSON) {
            const baseFeatures = {
              type: 'FeatureCollection' as const,
              features: data.features.filter(
                f => !['nav_node', 'nav_edge', 'route_final'].includes(f.properties?.type)
              )
            };
            firstFloorGeoJSON = baseFeatures;
          }

          // Extrai dados de navegação
          const { nodes, namedNodes, instructions, edges } = parseNavigationFromGeoJSON(data);
          
          // Mescla tudo
          Object.assign(allNodes, nodes);
          Object.assign(allNamedNodes, namedNodes);
          Object.assign(allInstructions, instructions);
          allEdges.push(...edges);
          
          floorsFound.push(floor);
          console.log(`✅ Andar ${floor} carregado com sucesso`);
        } catch (err) {
          // Andar não existe, ignora
          if (floor === 1) {
            // Se não tem nem o andar 1, tenta mapa_completo.geojson
            console.warn(`mapa_andar${floor}.geojson não encontrado`);
          }
        }
      }

      // Se não achou nenhum andar, tenta mapa_completo.geojson
      if (floorsFound.length === 0) {
        console.log('Nenhum arquivo mapa_andarX.geojson encontrado, tentando mapa_completo.geojson...');
        
        try {
          const data = await loadGeoJSON('/mapa_completo.geojson');
          
          const baseFeatures = {
            type: 'FeatureCollection' as const,
            features: data.features.filter(
              f => !['nav_node', 'nav_edge', 'route_final'].includes(f.properties?.type)
            )
          };
          
          const { nodes, namedNodes, instructions, edges } = parseNavigationFromGeoJSON(data);
          
          Object.assign(allNodes, nodes);
          Object.assign(allNamedNodes, namedNodes);
          Object.assign(allInstructions, instructions);
          allEdges.push(...edges);
          
          firstFloorGeoJSON = baseFeatures;
          floorsFound.push(1);
        } catch (err2) {
          setError('Nenhum arquivo de mapa encontrado. Crie arquivos mapa_andar1.geojson, mapa_andar2.geojson, etc em public/');
          return;
        }
      }

      // Salva dados
      if (firstFloorGeoJSON) {
        setBaseGeoJSON(firstFloorGeoJSON);
      }
      
      setNodes(allNodes);
      setNamedNodes(allNamedNodes);
      setNodeInstructions(allInstructions);
      setEdges(allEdges);
      setAvailableFloors(floorsFound);

      console.log(`📊 Total carregado: ${Object.keys(allNodes).length} nós, ${allEdges.length} arestas, ${floorsFound.length} andares`);

      // Encontra "Você está aqui"
      const startKey = Object.keys(allNamedNodes).find(
        key => normalizeText(allNamedNodes[key]) === normalizeText('Você está aqui')
      );
      
      if (startKey) {
        setStartNodePosition(allNodes[startKey]);
      }
    };

    loadAllFloors();
  }, []);

  // Timer de inatividade (30 segundos)
  useEffect(() => {
    const resetTimer = () => setLastInteraction(Date.now());

    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    const interval = setInterval(() => {
      if (Date.now() - lastInteraction > 30000 && route.length > 0) {
        clearRoute();
        onBack();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [lastInteraction, route, onBack, clearRoute]);

  const handleSelectDestination = (destinationName: string) => {
    const success = calculateRoute(destinationName);
    if (success) {
      setLastInteraction(Date.now());
    }
  };

  // Converte rota para NodeKeys para PathInstructions
  const pathKeys = route.map(coord => roundKey(coord));

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="relative h-20 bg-white shadow flex items-center px-8">
        <img src="/logo-hc.png" className="h-48 w-auto object-contain" />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-3xl font-bold">
          Navegação no Hospital
        </h1>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Tela de busca (se não houver rota) */}
        {route.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-12">
            
            {/* Seletor de modo de busca */}
            <div className="mb-8 flex gap-4">
              <button
                onClick={() => setSearchMode('lista')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  searchMode === 'lista'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Buscar pela Lista
              </button>
              <button
                onClick={() => setSearchMode('prontuario')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  searchMode === 'prontuario'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Buscar por Prontuário
              </button>
            </div>

            {/* Erro */}
            {error && (
              <div className="mb-4 max-w-2xl w-full bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Componente de busca */}
            {searchMode === 'lista' ? (
              <SearchByList
                namedNodes={namedNodes}
                onSelect={handleSelectDestination}
              />
            ) : (
              <SearchByProntuario
                namedNodes={namedNodes}
                onSuccess={handleSelectDestination}
              />
            )}
          </div>
        ) : (
          // Tela de navegação (com rota)
          <>
            {/* Lado esquerdo: Mapa */}
            <div className="flex-1 relative">
              <div className="absolute inset-0">
                <LeafletMap baseGeoJSON={baseGeoJSON}>
                  <MapEdges edges={edges} />
                  {/* Mostra apenas nós nomeados na navegação */}
                  <MapNodes nodes={nodes} namedNodes={namedNodes} showOnlyNamed={true} />
                  <MapRoute route={route} />
                  {/* Centraliza no ponto de partida quando a rota é calculada */}
                  {route.length > 0 && startNodePosition && (
                    <CenterOnNode position={startNodePosition} zoom={1} />
                  )}
                </LeafletMap>
              </div>

              {/* Botão voltar */}
              <button
                onClick={() => {
                  clearRoute();
                  setLastInteraction(Date.now());
                }}
                className="absolute top-4 right-4 z-[1000] flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold shadow-lg hover:bg-slate-700 transition"
              >
                <MdArrowBack className="w-5 h-5" />
                Nova Busca
              </button>
            </div>

            {/* Lado direito: Instruções */}
            <div className="w-96 bg-white p-6 overflow-y-auto shadow-xl">
              <PathInstructions
                path={pathKeys}
                namedNodes={namedNodes}
                nodeInstructions={nodeInstructions}
              />

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-800 text-center">
                  ⏱️ Esta tela será resetada em 30 segundos de inatividade
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
