// src/services/graphService.ts

import type { Coordinate, NodeKey, Graph, NodesMap, Edge } from '../types/navigation';

/**
 * Arredonda uma coordenada para 6 casas decimais e cria uma chave única
 */
export function roundKey(point: Coordinate): NodeKey {
  return point.map(v => Number(v.toFixed(6))).join(',');
}

/**
 * Converte uma chave de volta para coordenada
 */
export function keyToCoordinate(key: NodeKey): Coordinate {
  return key.split(',').map(Number) as Coordinate;
}

/**
 * Encontra o nó mais próximo de um ponto
 * @param nodeKeys - Array de chaves de nós
 * @param point - Ponto de referência
 * @param threshold - Distância máxima para considerar (em pixels)
 * @returns Chave do nó mais próximo ou null
 */
export function nearestNodeKey(
  nodeKeys: NodeKey[],
  point: Coordinate,
  threshold: number = 10
): NodeKey | null {
  let bestKey: NodeKey | null = null;
  let bestDistance = Infinity;

  for (const key of nodeKeys) {
    const [x, y] = key.split(',').map(Number);
    const distance = Math.hypot(point[0] - x, point[1] - y);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestKey = key;
    }
  }

  return bestDistance <= threshold ? bestKey : null;
}

/**
 * Constrói o grafo bidirecional a partir de nós e arestas
 */
export function buildGraph(nodes: NodesMap, edges: Edge[]): Graph {
  const graph: Graph = {};

  // Inicializa todos os nós
  for (const key of Object.keys(nodes)) {
    graph[key] = {};
  }

  // Adiciona arestas bidirecionais com pesos (distância euclidiana)
  for (const edge of edges) {
    const keyA = roundKey(edge[0]);
    const keyB = roundKey(edge[1]);
    
    const distance = Math.hypot(
      edge[0][0] - edge[1][0],
      edge[0][1] - edge[1][1]
    );

    graph[keyA] = graph[keyA] || {};
    graph[keyB] = graph[keyB] || {};
    
    graph[keyA][keyB] = distance;
    graph[keyB][keyA] = distance;
  }

  return graph;
}

/**
 * MinHeap para Dijkstra eficiente
 */
class MinHeap {
  private nodes: Array<{ item: string; priority: number }> = [];

  push(item: string, priority: number): void {
    this.nodes.push({ item, priority });
    this.bubbleUp(this.nodes.length - 1);
  }

  pop(): string | null {
    if (this.nodes.length === 0) return null;
    
    const root = this.nodes[0].item;
    const last = this.nodes.pop()!;
    
    if (this.nodes.length > 0) {
      this.nodes[0] = last;
      this.sinkDown(0);
    }
    
    return root;
  }

  size(): number {
    return this.nodes.length;
  }

  private bubbleUp(n: number): void {
    const element = this.nodes[n];
    
    while (n > 0) {
      const parentIndex = Math.floor((n - 1) / 2);
      const parent = this.nodes[parentIndex];
      
      if (element.priority >= parent.priority) break;
      
      this.nodes[n] = parent;
      n = parentIndex;
    }
    
    this.nodes[n] = element;
  }

  private sinkDown(n: number): void {
    const length = this.nodes.length;
    const element = this.nodes[n];
    
    while (true) {
      const leftIndex = 2 * n + 1;
      const rightIndex = leftIndex + 1;
      let swap: number | null = null;
      
      if (leftIndex < length) {
        const left = this.nodes[leftIndex];
        if (left.priority < element.priority) {
          swap = leftIndex;
        }
      }
      
      if (rightIndex < length) {
        const right = this.nodes[rightIndex];
        if (
          (swap === null && right.priority < element.priority) ||
          (swap !== null && right.priority < this.nodes[leftIndex].priority)
        ) {
          swap = rightIndex;
        }
      }
      
      if (swap === null) break;
      
      this.nodes[n] = this.nodes[swap];
      n = swap;
    }
    
    this.nodes[n] = element;
  }
}

/**
 * Algoritmo de Dijkstra para encontrar o caminho mais curto
 * @param graph - Grafo com pesos
 * @param start - Nó inicial
 * @param end - Nó final
 * @returns Array de chaves representando o caminho (vazio se não houver caminho)
 */
export function dijkstra(graph: Graph, start: NodeKey, end: NodeKey): NodeKey[] {
  if (!graph[start] || !graph[end]) {
    return [];
  }

  const distances: Record<NodeKey, number> = {};
  const previous: Record<NodeKey, NodeKey | undefined> = {};
  const heap = new MinHeap();

  // Inicializa distâncias
  for (const key of Object.keys(graph)) {
    distances[key] = Infinity;
  }
  distances[start] = 0;
  heap.push(start, 0);

  // Executa Dijkstra
  while (heap.size() > 0) {
    const current = heap.pop()!;
    
    if (current === end) break;

    const currentDistance = distances[current];
    
    for (const [neighbor, weight] of Object.entries(graph[current] || {})) {
      const distance = currentDistance + weight;
      
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = current;
        heap.push(neighbor, distance);
      }
    }
  }

  // Reconstrói o caminho
  const path: NodeKey[] = [];
  let current: NodeKey | undefined = end;
  
  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return path.length > 1 ? path : [];
}
