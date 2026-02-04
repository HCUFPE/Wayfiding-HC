// src/hooks/useGraphEditor.ts

import { useState, useEffect, useRef } from 'react';
import type { 
  NodesMap, 
  NamedNodesMap, 
  InstructionsMap, 
  Edge, 
  Route, 
  GeoJSONData,
  EditorMode,
  Coordinate,
  Graph,
  NodeKey
} from '../types/navigation';
import { buildGraph, dijkstra, roundKey, nearestNodeKey, keyToCoordinate } from '../services/graphService';
import { pointToSegmentDistance } from '../services/geometryUtils';
import { createCompleteGeoJSON, downloadGeoJSON } from '../services/geoJsonService';

export function useGraphEditor(baseGeoJSON: GeoJSONData | null) {
  const [nodes, setNodes] = useState<NodesMap>({});
  const [edges, setEdges] = useState<Edge[]>([]);
  const [named, setNamed] = useState<NamedNodesMap>({});
  const [instructions, setInstructions] = useState<InstructionsMap>({});
  const [route, setRoute] = useState<Route>([]);
  const [mode, setMode] = useState<EditorMode>('add-node');

  const edgeSelectionRef = useRef<NodeKey[]>([]);
  const nodeKeysRef = useRef<NodeKey[]>([]);
  const graphRef = useRef<Graph>({});

  // Atualiza referências quando os nós mudam
  useEffect(() => {
    nodeKeysRef.current = Object.keys(nodes);
    graphRef.current = buildGraph(nodes, edges);
  }, [nodes, edges]);

  /**
   * Handler de clique no mapa
   */
  const handleMapClick = (point: Coordinate) => {
    switch (mode) {
      case 'add-node':
        handleAddNode(point);
        break;
      case 'add-edge':
        handleAddEdge(point);
        break;
      case 'name-node':
        handleNameNode(point);
        break;
      case 'instruction-node':
        handleInstructionNode(point);
        break;
      case 'delete':
        handleDelete(point);
        break;
      case 'view':
        handleViewRoute(point);
        break;
    }
  };

  /**
   * Adiciona um novo nó
   */
  const handleAddNode = (point: Coordinate) => {
    const key = roundKey(point);
    
    if (nodes[key]) {
      return; // Nó já existe
    }

    setNodes(prev => ({ ...prev, [key]: point }));
  };

  /**
   * Adiciona uma aresta entre dois nós
   */
  const handleAddEdge = (point: Coordinate) => {
    const snap = nearestNodeKey(nodeKeysRef.current, point, 12);
    
    if (!snap) return;

    edgeSelectionRef.current.push(snap);

    if (edgeSelectionRef.current.length >= 2) {
      const [key1, key2] = edgeSelectionRef.current.splice(0, 2);
      const nodeA = nodes[key1];
      const nodeB = nodes[key2];

      // Verifica se aresta já existe
      const exists = edges.some(edge => {
        const edgeKeyA = roundKey(edge[0]);
        const edgeKeyB = roundKey(edge[1]);
        return (
          (edgeKeyA === key1 && edgeKeyB === key2) ||
          (edgeKeyA === key2 && edgeKeyB === key1)
        );
      });

      if (!exists) {
        setEdges(prev => [...prev, [nodeA, nodeB]]);
      }
    }
  };

  /**
   * Nomeia um nó
   */
  const handleNameNode = (point: Coordinate) => {
    const snap = nearestNodeKey(nodeKeysRef.current, point, 12);
    
    if (!snap) return;

    const currentName = named[snap] || '';
    const name = prompt('Nome para este nó (ex: Pediatria, Você está aqui):', currentName);
    
    if (name === null) return;

    if (name.trim() === '') {
      setNamed(prev => {
        const copy = { ...prev };
        delete copy[snap];
        return copy;
      });
    } else {
      setNamed(prev => ({ ...prev, [snap]: name.trim() }));
    }
  };

  /**
   * Adiciona instrução a um nó
   */
  const handleInstructionNode = (point: Coordinate) => {
    const snap = nearestNodeKey(nodeKeysRef.current, point, 12);
    
    if (!snap) return;

    const currentInstr = instructions[snap] || '';
    const instr = prompt(
      'Instrução personalizada (ex: Passe pela porta ao lado da escada):',
      currentInstr
    );
    
    if (instr === null) return;

    if (instr.trim() === '') {
      setInstructions(prev => {
        const copy = { ...prev };
        delete copy[snap];
        return copy;
      });
    } else {
      setInstructions(prev => ({ ...prev, [snap]: instr.trim() }));
    }
  };

  /**
   * Deleta nó ou aresta
   */
  const handleDelete = (point: Coordinate) => {
    // Tenta deletar nó primeiro
    const snap = nearestNodeKey(nodeKeysRef.current, point, 12);
    
    if (snap) {
      setNodes(prev => {
        const copy = { ...prev };
        delete copy[snap];
        return copy;
      });
      
      setNamed(prev => {
        const copy = { ...prev };
        delete copy[snap];
        return copy;
      });
      
      setInstructions(prev => {
        const copy = { ...prev };
        delete copy[snap];
        return copy;
      });
      
      setEdges(prev => 
        prev.filter(edge => 
          !(roundKey(edge[0]) === snap || roundKey(edge[1]) === snap)
        )
      );
      
      return;
    }

    // Tenta deletar aresta
    const threshold = 6;
    setEdges(prev => 
      prev.filter(edge => {
        const dist = pointToSegmentDistance(point, edge[0], edge[1]);
        return dist > threshold;
      })
    );
  };

  /**
   * Visualiza/testa rota
   */
  const handleViewRoute = (point: Coordinate) => {
    setRoute([]);

    // Usa uma fila de cliques
    const clickQueue = ((handleViewRoute as any)._queue as Coordinate[]) || [];
    clickQueue.push(point);
    
    if (clickQueue.length > 2) {
      clickQueue.shift();
    }

    (handleViewRoute as any)._queue = clickQueue;

    if (clickQueue.length === 2) {
      const startSnap = nearestNodeKey(nodeKeysRef.current, clickQueue[0], 20);
      const endSnap = nearestNodeKey(nodeKeysRef.current, clickQueue[1], 20);

      if (!startSnap || !endSnap) {
        alert('Clique mais próximo dos nós.');
        (handleViewRoute as any)._queue = [];
        return;
      }

      const path = dijkstra(graphRef.current, startSnap, endSnap);

      if (path.length === 0) {
        alert('Caminho não encontrado.');
        (handleViewRoute as any)._queue = [];
        return;
      }

      const coords = path.map(key => keyToCoordinate(key));
      setRoute(coords);
      (handleViewRoute as any)._queue = [];
    }
  };

  /**
   * Salva o mapa completo
   */
  const saveMap = (floorNumber?: number) => {
    if (!baseGeoJSON) {
      alert('Mapa base não carregado');
      return;
    }

    const completeGeoJSON = createCompleteGeoJSON(
      baseGeoJSON,
      nodes,
      named,
      instructions,
      edges,
      route
    );

    // Determina o nome do arquivo
    let filename = 'mapa_completo.geojson';
    if (floorNumber) {
      filename = `mapa_andar${floorNumber}.geojson`;
    }

    downloadGeoJSON(completeGeoJSON, filename);
  };

  /**
   * Limpa todo o grafo
   */
  const clearGraph = () => {
    if (!confirm('Tem certeza que deseja limpar todo o grafo?')) {
      return;
    }

    setNodes({});
    setEdges([]);
    setNamed({});
    setInstructions({});
    setRoute([]);
    edgeSelectionRef.current = [];
  };

  return {
    // Estado
    nodes,
    edges,
    named,
    instructions,
    route,
    mode,
    
    // Setters
    setMode,
    setNodes,
    setEdges,
    setNamed,
    setInstructions,
    setRoute,
    
    // Refs
    edgeSelectionRef,
    
    // Ações
    handleMapClick,
    saveMap,
    clearGraph
  };
}
