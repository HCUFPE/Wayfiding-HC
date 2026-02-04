// src/hooks/useMultiFloorNavigation.ts

import { useState, useEffect } from 'react';
import type { NodesMap, NamedNodesMap, InstructionsMap, Edge, NodeKey, Coordinate, GeoJSONData } from '../types/navigation';
import { loadGeoJSON, parseNavigationFromGeoJSON } from '../services/geoJsonService';
import { buildGraph, dijkstra, keyToCoordinate, roundKey } from '../services/graphService';
import { normalizeText } from '../services/apiService';

interface FloorData {
  floorNumber: number;
  baseGeoJSON: GeoJSONData;
  nodes: NodesMap;
  namedNodes: NamedNodesMap;
  nodeInstructions: InstructionsMap;
  edges: Edge[];
}

interface FloorTransition {
  nodeKey: NodeKey;
  nodeName: string;
  fromFloor: number;
  toFloor: number;
  type: 'stairs' | 'elevator';
}

export function useMultiFloorNavigation() {
  const [floors, setFloors] = useState<Map<number, FloorData>>(new Map());
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [routeWithFloors, setRouteWithFloors] = useState<Array<{ coord: Coordinate; floor: number }>>([]);
  const [error, setError] = useState<string>('');
  const [transitions, setTransitions] = useState<FloorTransition[]>([]);

  // Carrega todos os andares
  useEffect(() => {
    const loadAllFloors = async () => {
      const floorsData = new Map<number, FloorData>();

      for (let floor = 1; floor <= 10; floor++) {
        try {
          const data = await loadGeoJSON(`/mapa_andar${floor}.geojson`);
          
          const baseFeatures = {
            type: 'FeatureCollection' as const,
            features: data.features.filter(
              f => !['nav_node', 'nav_edge', 'route_final'].includes(f.properties?.type)
            )
          };

          const { nodes, namedNodes, instructions, edges } = parseNavigationFromGeoJSON(data);

          floorsData.set(floor, {
            floorNumber: floor,
            baseGeoJSON: baseFeatures,
            nodes,
            namedNodes,
            nodeInstructions: instructions,
            edges
          });

          console.log(`✅ Andar ${floor} carregado: ${Object.keys(nodes).length} nós`);
        } catch (err) {
          // Andar não existe
          break;
        }
      }

      if (floorsData.size === 0) {
        setError('Nenhum arquivo mapa_andarX.geojson encontrado');
      } else {
        setFloors(floorsData);
        detectTransitions(floorsData);
      }
    };

    loadAllFloors();
  }, []);

  // Detecta pontos de transição (escadas/elevadores) entre andares
  const detectTransitions = (floorsData: Map<number, FloorData>) => {
    const foundTransitions: FloorTransition[] = [];
    const floorsList = Array.from(floorsData.keys()).sort((a, b) => a - b);

    for (let i = 0; i < floorsList.length - 1; i++) {
      const currentFloorNum = floorsList[i];
      const nextFloorNum = floorsList[i + 1];
      
      const currentFloorData = floorsData.get(currentFloorNum)!;
      const nextFloorData = floorsData.get(nextFloorNum)!;

      // Procura nós com mesmo nome em andares adjacentes
      for (const [nodeKey, nodeName] of Object.entries(currentFloorData.namedNodes)) {
        const normalizedName = normalizeText(nodeName);
        
        // Verifica se é escada ou elevador
        const isStairs = normalizedName.includes('escada') || normalizedName.includes('stairs');
        const isElevator = normalizedName.includes('elevador') || normalizedName.includes('elevator');
        
        if (!isStairs && !isElevator) continue;

        // Procura mesmo nome no próximo andar
        for (const [nextNodeKey, nextNodeName] of Object.entries(nextFloorData.namedNodes)) {
          if (normalizeText(nextNodeName) === normalizedName) {
            // Encontrou transição!
            foundTransitions.push({
              nodeKey,
              nodeName,
              fromFloor: currentFloorNum,
              toFloor: nextFloorNum,
              type: isElevator ? 'elevator' : 'stairs'
            });

            console.log(`🔗 Transição detectada: ${nodeName} (${currentFloorNum}º → ${nextFloorNum}º)`);
          }
        }
      }
    }

    setTransitions(foundTransitions);
  };

  // Calcula rota entre dois pontos (pode passar por múltiplos andares)
  const calculateRoute = (startName: string, endName: string): boolean => {
    setError('');
    setRoute([]);
    setRouteWithFloors([]);

    // Encontra ponto de partida e destino
    let startFloor: number | null = null;
    let startKey: NodeKey | null = null;
    let endFloor: number | null = null;
    let endKey: NodeKey | null = null;

    for (const [floorNum, floorData] of floors.entries()) {
      for (const [key, name] of Object.entries(floorData.namedNodes)) {
        if (normalizeText(name) === normalizeText(startName)) {
          startFloor = floorNum;
          startKey = key;
        }
        if (normalizeText(name) === normalizeText(endName)) {
          endFloor = floorNum;
          endKey = key;
        }
      }
    }

    if (!startKey || !endKey || startFloor === null || endFloor === null) {
      setError('Ponto de partida ou destino não encontrado');
      return false;
    }

    // Se estão no mesmo andar, rota simples
    if (startFloor === endFloor) {
      const floorData = floors.get(startFloor)!;
      const graph = buildGraph(floorData.nodes, floorData.edges);
      const path = dijkstra(graph, startKey, endKey);

      if (path.length === 0) {
        setError('Caminho não encontrado');
        return false;
      }

      const coords = path.map(k => keyToCoordinate(k));
      setRoute(coords);
      setRouteWithFloors(coords.map(c => ({ coord: c, floor: startFloor })));
      setCurrentFloor(startFloor);
      return true;
    }

    // Rota multi-andar
    return calculateMultiFloorRoute(startFloor, startKey, endFloor, endKey);
  };

  // Calcula rota atravessando múltiplos andares
  const calculateMultiFloorRoute = (
    startFloor: number,
    startKey: NodeKey,
    endFloor: number,
    endKey: NodeKey
  ): boolean => {
    // Constrói grafo unificado com conexões entre andares
    const unifiedGraph: Record<string, Record<string, number>> = {};
    
    // Adiciona nós e arestas de cada andar
    for (const [floorNum, floorData] of floors.entries()) {
      const floorGraph = buildGraph(floorData.nodes, floorData.edges);
      
      for (const [node, neighbors] of Object.entries(floorGraph)) {
        const nodeWithFloor = `${node}@${floorNum}`;
        unifiedGraph[nodeWithFloor] = {};
        
        for (const [neighbor, distance] of Object.entries(neighbors)) {
          const neighborWithFloor = `${neighbor}@${floorNum}`;
          unifiedGraph[nodeWithFloor][neighborWithFloor] = distance;
        }
      }
    }

    // Adiciona conexões entre andares (transições)
    for (const transition of transitions) {
      const { nodeKey, fromFloor, toFloor } = transition;
      
      // Encontra nó correspondente no outro andar
      const fromFloorData = floors.get(fromFloor)!;
      const toFloorData = floors.get(toFloor)!;
      const nodeName = fromFloorData.namedNodes[nodeKey];
      
      // Procura mesmo nome no outro andar
      let toNodeKey: NodeKey | null = null;
      for (const [key, name] of Object.entries(toFloorData.namedNodes)) {
        if (normalizeText(name) === normalizeText(nodeName)) {
          toNodeKey = key;
          break;
        }
      }

      if (toNodeKey) {
        const fromNode = `${nodeKey}@${fromFloor}`;
        const toNode = `${toNodeKey}@${toFloor}`;
        
        // Peso da transição (elevador mais rápido que escada)
        const transitionWeight = transition.type === 'elevator' ? 20 : 50;
        
        // Conexão bidirecional
        unifiedGraph[fromNode] = unifiedGraph[fromNode] || {};
        unifiedGraph[toNode] = unifiedGraph[toNode] || {};
        unifiedGraph[fromNode][toNode] = transitionWeight;
        unifiedGraph[toNode][fromNode] = transitionWeight;
      }
    }

    // Executa Dijkstra no grafo unificado
    const startWithFloor = `${startKey}@${startFloor}`;
    const endWithFloor = `${endKey}@${endFloor}`;
    
    const path = dijkstra(unifiedGraph, startWithFloor, endWithFloor);

    if (path.length === 0) {
      setError('Caminho não encontrado entre andares');
      return false;
    }

    // Converte path de volta para coordenadas com informação de andar
    const routeData: Array<{ coord: Coordinate; floor: number }> = [];
    
    for (const nodeWithFloor of path) {
      const [nodeKey, floorStr] = nodeWithFloor.split('@');
      const floor = parseInt(floorStr);
      const floorData = floors.get(floor);
      
      if (floorData && floorData.nodes[nodeKey]) {
        routeData.push({
          coord: floorData.nodes[nodeKey],
          floor
        });
      }
    }

    setRouteWithFloors(routeData);
    setRoute(routeData.map(r => r.coord));
    setCurrentFloor(startFloor);
    return true;
  };

  return {
    floors,
    currentFloor,
    setCurrentFloor,
    route,
    routeWithFloors,
    error,
    setError,
    calculateRoute,
    clearRoute: () => {
      setRoute([]);
      setRouteWithFloors([]);
    },
    transitions
  };
}
