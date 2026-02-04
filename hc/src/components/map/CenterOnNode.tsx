// src/components/map/CenterOnNode.tsx

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { Coordinate } from '../../types/navigation';

interface CenterOnNodeProps {
  position: Coordinate | null;
  zoom?: number;
}

/**
 * Componente que centraliza o mapa em uma posição específica
 */
export function CenterOnNode({ position, zoom = 2 }: CenterOnNodeProps) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      const [x, y] = position;
      // Leaflet usa [lat, lng] = [y, x]
      map.setView([y, x], zoom, {
        animate: true,
        duration: 1
      });
    }
  }, [position, zoom, map]);

  return null;
}
