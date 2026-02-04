// src/services/geoJsonService.ts

import type { 
  GeoJSONData, 
  NodesMap, 
  NamedNodesMap, 
  InstructionsMap, 
  Edge,
  Route 
} from '../types/navigation';
import { roundKey } from './graphService';

/**
 * Carrega dados de navegação de um GeoJSON
 */
export function parseNavigationFromGeoJSON(geoJson: GeoJSONData) {
  const nodes: NodesMap = {};
  const namedNodes: NamedNodesMap = {};
  const instructions: InstructionsMap = {};
  const edges: Edge[] = [];

  for (const feature of geoJson.features) {
    const props = feature.properties;

    // Extrai nós de navegação
    if (
      feature.geometry?.type === 'Point' && 
      props?.type === 'nav_node'
    ) {
      const key = props.id as string;
      const coords = feature.geometry.coordinates as [number, number];
      
      nodes[key] = coords;
      
      if (props.name) {
        namedNodes[key] = props.name;
      }
      
      if (props.instruction) {
        instructions[key] = props.instruction;
      }
    }

    // Extrai arestas
    if (
      feature.geometry?.type === 'LineString' && 
      props?.type === 'nav_edge' &&
      feature.geometry.coordinates.length === 2
    ) {
      edges.push(feature.geometry.coordinates as Edge);
    }
  }

  return { nodes, namedNodes, instructions, edges };
}

/**
 * Extrai apenas as features da planta base (sem dados de navegação)
 */
export function getBaseFeatures(geoJson: GeoJSONData): GeoJSONData {
  const baseFeatures = geoJson.features.filter(
    f => !['nav_node', 'nav_edge', 'route_final'].includes(f.properties?.type)
  );

  return {
    type: 'FeatureCollection',
    features: baseFeatures
  };
}

/**
 * Cria um GeoJSON completo com planta base + dados de navegação
 */
export function createCompleteGeoJSON(
  baseGeoJSON: GeoJSONData | null,
  nodes: NodesMap,
  namedNodes: NamedNodesMap,
  instructions: InstructionsMap,
  edges: Edge[],
  route: Route = []
): GeoJSONData {
  const features = [...(baseGeoJSON?.features || [])];

  // Adiciona nós
  for (const [key, position] of Object.entries(nodes)) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: position
      },
      properties: {
        type: 'nav_node',
        id: key,
        name: namedNodes[key] || null,
        instruction: instructions[key] || null
      }
    });
  }

  // Adiciona arestas
  for (const edge of edges) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: edge
      },
      properties: {
        type: 'nav_edge'
      }
    });
  }

  // Adiciona rota (se existir)
  if (route.length > 1) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: route
      },
      properties: {
        type: 'route_final'
      }
    });
  }

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Exporta GeoJSON para download
 */
export function downloadGeoJSON(geoJson: GeoJSONData, filename: string = 'mapa_completo.geojson'): void {
  const blob = new Blob([JSON.stringify(geoJson, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Carrega GeoJSON de uma URL
 */
export async function loadGeoJSON(url: string): Promise<GeoJSONData> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Erro ao carregar GeoJSON: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data?.features) {
    throw new Error('Arquivo GeoJSON inválido');
  }
  
  return data;
}
