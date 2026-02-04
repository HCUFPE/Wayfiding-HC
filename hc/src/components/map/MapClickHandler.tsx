import { useMapEvents } from 'react-leaflet';
import type { Coordinate, EditorMode } from '../../types/navigation';

interface MapClickHandlerProps {
  mode: EditorMode;
  onMapClick: (point: Coordinate) => void;
}


export function MapClickHandler({ mode, onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const point: Coordinate = [lng, lat];
      onMapClick(point);
    }
  });

  return null;
}
