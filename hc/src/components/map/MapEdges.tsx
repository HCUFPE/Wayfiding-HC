import { Polyline } from 'react-leaflet';
import type { Edge } from '../../types/navigation';

interface MapEdgesProps {
  edges: Edge[];
  color?: string;
  weight?: number;
}

/**
 * Renderiza as arestas do grafo no mapa
 */
export function MapEdges({ edges, color = '#1f77b4', weight = 4 }: MapEdgesProps) {
  return (
    <>
      {edges.map((edge, index) => {
        const [start, end] = edge;
        // Leaflet usa [lat, lng] = [y, x]
        const positions: [number, number][] = [
          [start[1], start[0]],
          [end[1], end[0]]
        ];

        return (
          <Polyline
            key={index}
            positions={positions}
            pathOptions={{
              color,
              weight,
              opacity: 0.8
            }}
          />
        );
      })}
    </>
  );
}
