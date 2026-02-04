import { Polyline } from 'react-leaflet';
import type { Route } from '../../types/navigation';

interface MapRouteProps {
  route: Route;
  color?: string;
  weight?: number;
}

/**
 * Renderiza a rota calculada no mapa
 */
export function MapRoute({ route, color = '#ef4444', weight = 6 }: MapRouteProps) {
  if (route.length === 0) return null;

  const positions: [number, number][] = route.map(([x, y]) => [y, x]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color,
        weight,
        opacity: 0.9,
        dashArray: '10, 5'
      }}
    />
  );
}
