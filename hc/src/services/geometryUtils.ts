// src/services/geometryUtils.ts

import type { Coordinate } from '../types/navigation';

/**
 * Calcula a distância de um ponto para um segmento de linha
 * @param point - Ponto [x, y]
 * @param segmentStart - Início do segmento [x, y]
 * @param segmentEnd - Fim do segmento [x, y]
 * @returns Distância mínima do ponto ao segmento
 */
export function pointToSegmentDistance(
  point: Coordinate,
  segmentStart: Coordinate,
  segmentEnd: Coordinate
): number {
  const [px, py] = point;
  const [x1, y1] = segmentStart;
  const [x2, y2] = segmentEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Segmento é um ponto
    return Math.hypot(px - x1, py - y1);
  }

  // Projeção do ponto no segmento (parametrizada entre 0 e 1)
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(px - projX, py - projY);
}

/**
 * Calcula a distância euclidiana entre dois pontos
 */
export function distance(p1: Coordinate, p2: Coordinate): number {
  return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

/**
 * Verifica se dois pontos são aproximadamente iguais
 */
export function pointsEqual(p1: Coordinate, p2: Coordinate, tolerance = 0.000001): boolean {
  return Math.abs(p1[0] - p2[0]) < tolerance && Math.abs(p1[1] - p2[1]) < tolerance;
}
