// src/components/map/LeafletMap.tsx

import { useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoJSONData } from '../../types/navigation';

interface LeafletMapProps {
  baseGeoJSON: GeoJSONData | null;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Componente que ajusta o zoom automaticamente ao GeoJSON
 */
function FitToGeoJSON({ geojson }: { geojson: GeoJSONData }) {
  const map = useMap();

  useEffect(() => {
    if (!geojson?.features?.length) return;

    const geoJsonLayer = L.geoJSON(geojson as any);
    const bounds = geoJsonLayer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [geojson, map]);

  return null;
}

/**
 * Componente base do mapa Leaflet
 */
export function LeafletMap({ baseGeoJSON, children, className = '' }: LeafletMapProps) {
  
  /**
   * Estilos para diferentes tipos de features do GeoJSON
   */
  const getFeatureStyle = (feature: any) => {
    const type = feature?.properties?.type;

    switch (type) {
      case 'nav_area':
        return {
          fillColor: '#90ee90',
          fillOpacity: 0.35,
          weight: 1,
          color: '#338833'
        };
      case 'wall':
        return {
          color: '#111',
          weight: 3
        };
      case 'door':
        return {
          color: '#8B4513',
          weight: 6,
          dashArray: '8,8'
        };
      case 'furniture':
        return {
          color: '#6666cc',
          weight: 2
        };
      case 'stairs':
        return {
          color: '#FFD700',
          weight: 8
        };
      case 'elevator':
        return {
          color: '#00CED1',
          weight: 8
        };
      default:
        return {
          color: '#666',
          weight: 1,
          opacity: 0.7
        };
    }
  };

  /**
   * Renderização de pontos (labels, etc)
   */
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    if (feature.properties?.type === 'label' && feature.properties.text) {
      return L.marker(latlng, {
        icon: L.divIcon({
          html: `<div style="background:#fff; padding:4px 8px; border-radius:4px; font-weight:bold; border:1px solid #333;">${feature.properties.text}</div>`,
          iconSize: [140, 40],
          className: 'leaflet-label-icon'
        })
      });
    }
    return L.circleMarker(latlng, { radius: 6 });
  };

  return (
    <MapContainer
      crs={L.CRS.Simple}
      center={[0, 0]}
      zoom={-5}
      className={`w-full h-full ${className}`}
      style={{ background: '#f0f0f0' }}
    >
      {baseGeoJSON && (
        <>
          <GeoJSON
            key={JSON.stringify(baseGeoJSON)}
            data={baseGeoJSON as any}
            style={getFeatureStyle}
            pointToLayer={pointToLayer}
          />
          <FitToGeoJSON geojson={baseGeoJSON} />
        </>
      )}
      
      {children}
    </MapContainer>
  );
}
