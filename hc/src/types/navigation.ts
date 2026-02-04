// src/types/navigation.ts

/**
 * Coordenada no formato [x, y]
 */
export type Coordinate = [number, number];

/**
 * Chave única de um nó no formato "x,y" (arredondado para 6 casas decimais)
 */
export type NodeKey = string;

/**
 * Estrutura de um nó no grafo
 */
export interface Node {
  key: NodeKey;
  position: Coordinate;
  name?: string;
  instruction?: string;
  floor?: number; // Número do andar
}

/**
 * Mapa de nós: { "x,y": [x, y] }
 */
export type NodesMap = Record<NodeKey, Coordinate>;

/**
 * Mapa de nós com informação de andar: { "x,y": floor_number }
 */
export type NodeFloorsMap = Record<NodeKey, number>;

/**
 * Mapa de nós nomeados: { "x,y": "Nome do Local" }
 */
export type NamedNodesMap = Record<NodeKey, string>;

/**
 * Mapa de instruções: { "x,y": "Instrução personalizada" }
 */
export type InstructionsMap = Record<NodeKey, string>;

/**
 * Aresta conectando dois pontos
 */
export type Edge = [Coordinate, Coordinate];

/**
 * Grafo para Dijkstra: { "x,y": { "a,b": distancia, ... } }
 */
export type Graph = Record<NodeKey, Record<NodeKey, number>>;

/**
 * Rota calculada (sequência de coordenadas)
 */
export type Route = Coordinate[];

/**
 * Modos do editor
 */
export type EditorMode = 
  | "add-node"
  | "add-edge"
  | "name-node"
  | "instruction-node"
  | "delete"
  | "view";

/**
 * Feature do GeoJSON
 */
export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point" | "LineString" | "Polygon" | "MultiLineString";
    coordinates: any;
  };
  properties: {
    type?: string;
    id?: string;
    name?: string;
    instruction?: string;
    text?: string;
    [key: string]: any;
  };
}

/**
 * GeoJSON completo
 */
export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

/**
 * Dados de um paciente da API
 */
export interface Paciente {
  Numero: number;
  Nome: string;
  "Local/Consultório": string;
  [key: string]: any;
}

/**
 * Resultado do Dijkstra
 */
export interface DijkstraResult {
  path: NodeKey[];
  distance: number;
}

/**
 * Estado da aplicação
 */
export interface NavigationState {
  nodes: NodesMap;
  edges: Edge[];
  namedNodes: NamedNodesMap;
  nodeInstructions: InstructionsMap;
  route: Route;
  baseGeoJSON: GeoJSONData | null;
}

/**
 * Props para componentes de mapa
 */
export interface MapComponentProps {
  baseGeoJSON: GeoJSONData | null;
  nodes: NodesMap;
  namedNodes: NamedNodesMap;
  nodeInstructions: InstructionsMap;
  route: Route;
}
