// src/services/floorUtils.ts

import type { NodeKey, NodesMap, NamedNodesMap, InstructionsMap } from '../types/navigation';

/**
 * Detecta se há mudança de andar na rota
 */
export interface FloorChange {
  nodeKey: NodeKey;
  nodeName?: string;
  instruction: string;
  type: 'stairs' | 'elevator';
  fromFloor?: string;
  toFloor?: string;
}

/**
 * Analisa a rota e detecta mudanças de andar baseado em nós especiais
 */
export function detectFloorChanges(
  pathKeys: NodeKey[],
  namedNodes: NamedNodesMap,
  nodeInstructions: InstructionsMap
): FloorChange[] {
  const floorChanges: FloorChange[] = [];

  for (let i = 0; i < pathKeys.length; i++) {
    const key = pathKeys[i];
    const name = namedNodes[key]?.toLowerCase() || '';
    const instruction = nodeInstructions[key];

    // Detecta escadas
    if (name.includes('escada') || name.includes('stairs')) {
      floorChanges.push({
        nodeKey: key,
        nodeName: namedNodes[key],
        instruction: instruction || 'Use a escada para mudar de andar',
        type: 'stairs'
      });
    }

    // Detecta elevador
    if (name.includes('elevador') || name.includes('elevator')) {
      floorChanges.push({
        nodeKey: key,
        nodeName: namedNodes[key],
        instruction: instruction || 'Use o elevador para mudar de andar',
        type: 'elevator'
      });
    }

    // Detecta por instrução customizada
    if (instruction) {
      const instrLower = instruction.toLowerCase();
      if (instrLower.includes('andar') || instrLower.includes('subir') || instrLower.includes('descer')) {
        if (!floorChanges.some(fc => fc.nodeKey === key)) {
          floorChanges.push({
            nodeKey: key,
            nodeName: namedNodes[key],
            instruction: instruction,
            type: instrLower.includes('elevador') ? 'elevator' : 'stairs'
          });
        }
      }
    }
  }

  return floorChanges;
}

/**
 * Extrai número do andar de um nome de nó
 * Exemplos: "Pediatria - 2º Andar" → "2"
 */
export function extractFloorNumber(nodeName: string): string | null {
  const patterns = [
    /(\d+)[ºo°]\s*andar/i,
    /andar\s*(\d+)/i,
    /floor\s*(\d+)/i,
    /f(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = nodeName.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Agrupa nós por andar
 */
export function groupNodesByFloor(
  nodes: NodesMap,
  namedNodes: NamedNodesMap
): Record<string, NodeKey[]> {
  const floors: Record<string, NodeKey[]> = {
    'unknown': []
  };

  for (const [key, _] of Object.entries(nodes)) {
    const name = namedNodes[key];
    if (!name) {
      floors['unknown'].push(key);
      continue;
    }

    const floorNum = extractFloorNumber(name);
    if (floorNum) {
      if (!floors[floorNum]) {
        floors[floorNum] = [];
      }
      floors[floorNum].push(key);
    } else {
      floors['unknown'].push(key);
    }
  }

  return floors;
}
