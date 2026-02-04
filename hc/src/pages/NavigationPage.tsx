// src/pages/NavigationPage.tsx

import { useState, useEffect } from 'react';
import { useMultiFloorNavigation } from '../hooks/useMultiFloorNavigation';
import { LeafletMap } from '../components/map/LeafletMap';
import { MapNodes } from '../components/map/MapNodes';
import { MapEdges } from '../components/map/MapEdges';
import { MapRoute } from '../components/map/MapRoute';
import { CenterOnNode } from '../components/map/CenterOnNode';
import { PathInstructions } from '../components/navigation/PathInstructions';
import { SearchByList } from '../components/navigation/SearchByList';
import { SearchByProntuario } from '../components/navigation/SearchByProntuario';
import { roundKey } from '../services/graphService';
import { normalizeText } from '../services/apiService';
import { MdArrowBack } from 'react-icons/md';

interface NavigationPageProps {
  onBack: () => void;
}

export function NavigationPage({ onBack }: NavigationPageProps) {
  const [searchMode, setSearchMode] = useState<'lista' | 'prontuario'>('prontuario');
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [startNodePosition, setStartNodePosition] = useState<[number, number] | null>(null);

  const {
    floors,
    currentFloor,
    setCurrentFloor,
    route,
    routeWithFloors,
    error,
    setError,
    calculateRoute: multiFloorCalculateRoute,
    clearRoute,
    transitions
  } = useMultiFloorNavigation();

  // Encontra "Você está aqui" quando os andares carregam
  useEffect(() => {
    for (const [_, floorData] of floors.entries()) {
      for (const [key, name] of Object.entries(floorData.namedNodes)) {
        if (normalizeText(name) === normalizeText('Você está aqui')) {
          setStartNodePosition(floorData.nodes[key]);
          setCurrentFloor(floorData.floorNumber);
          return;
        }
      }
    }
  }, [floors]);

  // Timer de inatividade
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
    const success = multiFloorCalculateRoute('Você está aqui', destinationName);
    if (success) {
      setLastInteraction(Date.now());
    }
  };

  // Dados do andar atual para exibição
  const currentFloorData = floors.get(currentFloor);
  
  // Pega TODOS os nós nomeados de TODOS os andares para a busca
  const allNamedNodes: Record<string, string> = {};
  floors.forEach(floorData => {
    Object.assign(allNamedNodes, floorData.namedNodes);
  });

  // Pega TODAS as instruções de TODOS os andares
  const allInstructions: Record<string, string> = {};
  floors.forEach(floorData => {
    Object.assign(allInstructions, floorData.nodeInstructions);
  });

  // Filtra rota para mostrar apenas pontos do andar atual
  const routeForCurrentFloor = routeWithFloors
    .filter(r => r.floor === currentFloor)
    .map(r => r.coord);

  // Converte rota completa para NodeKeys para PathInstructions
  const fullPathKeys = routeWithFloors.map(r => roundKey(r.coord));

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
                namedNodes={allNamedNodes}
                onSelect={handleSelectDestination}
              />
            ) : (
              <SearchByProntuario
                namedNodes={allNamedNodes}
                onSuccess={handleSelectDestination}
              />
            )}
          </div>
        ) : (
          // Tela de navegação (com rota)
          <>
            {/* Lado esquerdo: Mapa */}
            <div className="flex-1 relative">
              {currentFloorData && (
                <div className="absolute inset-0">
                  <LeafletMap baseGeoJSON={currentFloorData.baseGeoJSON}>
                    {/* APENAS arestas do andar atual */}
                    <MapEdges edges={currentFloorData.edges} />
                    
                    {/* APENAS nós do andar atual */}
                    <MapNodes 
                      nodes={currentFloorData.nodes} 
                      namedNodes={currentFloorData.namedNodes} 
                      showOnlyNamed={true} 
                    />
                    
                    {/* APENAS parte da rota que está neste andar */}
                    <MapRoute route={routeForCurrentFloor} />
                    
                    {/* Centraliza no ponto de partida */}
                    {route.length > 0 && startNodePosition && (
                      <CenterOnNode position={startNodePosition} zoom={1} />
                    )}
                  </LeafletMap>
                </div>
              )}

              {/* Seletor de Andares */}
              {floors.size > 1 && (
                <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-xl p-3">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Andares:</div>
                  <div className="flex flex-col gap-2">
                    {Array.from(floors.keys()).sort((a, b) => b - a).map(floorNum => (
                      <button
                        key={floorNum}
                        onClick={() => setCurrentFloor(floorNum)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          currentFloor === floorNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {floorNum}º Andar
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão voltar */}
              <button
                onClick={() => {
                  clearRoute();
                  setLastInteraction(Date.now());
                }}
                className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold shadow-lg hover:bg-slate-700 transition"
              >
                <MdArrowBack className="w-5 h-5" />
                Nova Busca
              </button>
            </div>

            {/* Lado direito: Instruções */}
            <div className="w-96 bg-white p-6 overflow-y-auto shadow-xl">
              <PathInstructions
                path={fullPathKeys}
                namedNodes={allNamedNodes}
                nodeInstructions={allInstructions}
              />

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-800 text-center">
                  ⏱️ Esta tela será resetada em 30 segundos de inatividade
                </div>
              </div>

              {/* Info de andares */}
              {floors.size > 1 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <div className="font-semibold mb-2">💡 Dica:</div>
                    <div>Use os botões de andar no canto superior direito para ver o caminho em cada andar.</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
