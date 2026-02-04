// src/hooks/useNavigation.ts

import { useState, useEffect, useRef } from 'react';
import type { 
  NodesMap, 
  NamedNodesMap, 
  InstructionsMap, 
  Edge, 
  Route, 
  GeoJSONData,
  Graph,
  NodeKey
} from '../types/navigation';
import { buildGraph, dijkstra, keyToCoordinate } from '../services/graphService';
import { normalizeText } from '../services/apiService';

export function useNavigation() {
  const [baseGeoJSON, setBaseGeoJSON] = useState<GeoJSONData | null>(null);
  const [nodes, setNodes] = useState<NodesMap>({});
  const [namedNodes, setNamedNodes] = useState<NamedNodesMap>({});
  const [nodeInstructions, setNodeInstructions] = useState<InstructionsMap>({});
  const [edges, setEdges] = useState<Edge[]>([]);
  const [route, setRoute] = useState<Route>([]);
  const [error, setError] = useState<string>('');
  
  const graphRef = useRef<Graph>({});

  // Reconstrói o grafo quando nós ou arestas mudam
  useEffect(() => {
    graphRef.current = buildGraph(nodes, edges);
  }, [nodes, edges]);

  /**
   * Calcula rota de "Você está aqui" até o destino
   */
  const calculateRoute = (destinationName: string): boolean => {
    setError('');
    setRoute([]);

    // Encontra ponto de partida
    const startKey = Object.keys(namedNodes).find(
      key => normalizeText(namedNodes[key]) === normalizeText('Você está aqui')
    );

    // Encontra destino
    const endKey = Object.keys(namedNodes).find(
      key => normalizeText(namedNodes[key]) === normalizeText(destinationName)
    );

    if (!startKey) {
      setError('Ponto de partida "Você está aqui" não encontrado no mapa.');
      return false;
    }

    if (!endKey) {
      setError(`Destino "${destinationName}" não encontrado no mapa.`);
      return false;
    }

    if (startKey === endKey) {
      setError('Você já está no destino!');
      return false;
    }

    // Calcula caminho
    const path = dijkstra(graphRef.current, startKey, endKey);

    if (path.length === 0) {
      setError('Não foi possível encontrar um caminho até o destino.');
      return false;
    }

    // Converte chaves para coordenadas
    const routeCoordinates = path.map(key => keyToCoordinate(key));
    setRoute(routeCoordinates);
    
    return true;
  };

  /**
   * Limpa a rota e erros
   */
  const clearRoute = () => {
    setRoute([]);
    setError('');
  };

  return {
    // Estado
    baseGeoJSON,
    nodes,
    namedNodes,
    nodeInstructions,
    edges,
    route,
    error,
    
    // Setters
    setBaseGeoJSON,
    setNodes,
    setNamedNodes,
    setNodeInstructions,
    setEdges,
    
    // Ações
    calculateRoute,
    clearRoute,
    setError
  };
}
