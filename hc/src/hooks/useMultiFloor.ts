// src/hooks/useMultiFloor.ts

import { useState, useEffect } from 'react';
import type { GeoJSONData, NodesMap, NamedNodesMap, InstructionsMap, Edge, NodeKey } from '../types/navigation';
import { loadGeoJSON, parseNavigationFromGeoJSON } from '../services/geoJsonService';

export interface FloorData {
  floorNumber: number;
  floorName: string;
  baseGeoJSON: GeoJSONData;
  nodes: NodesMap;
  namedNodes: NamedNodesMap;
  nodeInstructions: InstructionsMap;
  edges: Edge[];
}

export function useMultiFloor() {
  const [floors, setFloors] = useState<Map<number, FloorData>>(new Map());
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Carrega dados de um andar específico
   */
  const loadFloor = async (floorNumber: number): Promise<FloorData | null> => {
    try {
      // Tenta vários formatos de nome de arquivo
      const possibleNames = [
        `/mapa_andar${floorNumber}.geojson`,
        `/mapa_andar_${floorNumber}.geojson`,
        `/planta_andar${floorNumber}.geojson`,
        `/floor${floorNumber}.geojson`,
        `/andar${floorNumber}.geojson`,
      ];

      let data: GeoJSONData | null = null;
      let usedName = '';

      for (const name of possibleNames) {
        try {
          data = await loadGeoJSON(name);
          usedName = name;
          break;
        } catch (err) {
          // Tenta próximo nome
          continue;
        }
      }

      if (!data) {
        throw new Error(`Arquivo do andar ${floorNumber} não encontrado`);
      }

      // Separa features base dos dados de navegação
      const baseFeatures = {
        type: 'FeatureCollection' as const,
        features: data.features.filter(
          f => !['nav_node', 'nav_edge', 'route_final'].includes(f.properties?.type)
        )
      };

      const { nodes, namedNodes, instructions, edges } = parseNavigationFromGeoJSON(data);

      return {
        floorNumber,
        floorName: `${floorNumber}º Andar`,
        baseGeoJSON: baseFeatures,
        nodes,
        namedNodes,
        nodeInstructions: instructions,
        edges
      };
    } catch (err: any) {
      console.error(`Erro ao carregar andar ${floorNumber}:`, err);
      return null;
    }
  };

  /**
   * Carrega múltiplos andares
   */
  const loadFloors = async (floorNumbers: number[]) => {
    setLoading(true);
    setError('');

    const newFloors = new Map<number, FloorData>();

    for (const floorNum of floorNumbers) {
      const floorData = await loadFloor(floorNum);
      if (floorData) {
        newFloors.set(floorNum, floorData);
      }
    }

    if (newFloors.size === 0) {
      setError('Nenhum arquivo de andar encontrado. Tente usar um único arquivo mapa_completo.geojson');
    }

    setFloors(newFloors);
    setLoading(false);
  };

  /**
   * Carrega andar único (modo compatibilidade)
   */
  const loadSingleFloor = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await loadGeoJSON('/mapa_completo.geojson');
      
      const baseFeatures = {
        type: 'FeatureCollection' as const,
        features: data.features.filter(
          f => !['nav_node', 'nav_edge', 'route_final'].includes(f.properties?.type)
        )
      };

      const { nodes, namedNodes, instructions, edges } = parseNavigationFromGeoJSON(data);

      const singleFloor: FloorData = {
        floorNumber: 1,
        floorName: 'Único',
        baseGeoJSON: baseFeatures,
        nodes,
        namedNodes,
        nodeInstructions: instructions,
        edges
      };

      setFloors(new Map([[1, singleFloor]]));
    } catch (err) {
      // Fallback para planta.geojson
      try {
        const data = await loadGeoJSON('/planta.geojson');
        const baseFeatures = {
          type: 'FeatureCollection' as const,
          features: data.features
        };

        const singleFloor: FloorData = {
          floorNumber: 1,
          floorName: 'Único',
          baseGeoJSON: baseFeatures,
          nodes: {},
          namedNodes: {},
          nodeInstructions: {},
          edges: []
        };

        setFloors(new Map([[1, singleFloor]]));
        setError('⚠️ Mapa carregado sem dados de navegação. Use o Editor para criar o grafo.');
      } catch (err2: any) {
        setError('Erro ao carregar mapas: ' + err2.message);
      }
    }

    setLoading(false);
  };

  /**
   * Detecta qual andar contém um nó
   */
  const getFloorForNode = (nodeKey: NodeKey): number | null => {
    for (const [floorNum, floorData] of floors.entries()) {
      if (floorData.nodes[nodeKey]) {
        return floorNum;
      }
    }
    return null;
  };

  /**
   * Obtém todos os nós de todos os andares
   */
  const getAllNodes = (): NodesMap => {
    const allNodes: NodesMap = {};
    floors.forEach(floor => {
      Object.assign(allNodes, floor.nodes);
    });
    return allNodes;
  };

  /**
   * Obtém todos os nós nomeados de todos os andares
   */
  const getAllNamedNodes = (): NamedNodesMap => {
    const allNamed: NamedNodesMap = {};
    floors.forEach(floor => {
      Object.assign(allNamed, floor.namedNodes);
    });
    return allNamed;
  };

  /**
   * Obtém todas as instruções de todos os andares
   */
  const getAllInstructions = (): InstructionsMap => {
    const allInstructions: InstructionsMap = {};
    floors.forEach(floor => {
      Object.assign(allInstructions, floor.nodeInstructions);
    });
    return allInstructions;
  };

  /**
   * Obtém todas as arestas de todos os andares
   */
  const getAllEdges = (): Edge[] => {
    const allEdges: Edge[] = [];
    floors.forEach(floor => {
      allEdges.push(...floor.edges);
    });
    return allEdges;
  };

  return {
    floors,
    currentFloor,
    setCurrentFloor,
    loading,
    error,
    loadFloors,
    loadSingleFloor,
    getFloorForNode,
    getAllNodes,
    getAllNamedNodes,
    getAllInstructions,
    getAllEdges,
    hasMultipleFloors: floors.size > 1
  };
}
