import { Circle, Tooltip } from 'react-leaflet';
import type { NodesMap, NamedNodesMap } from '../../types/navigation';

interface MapNodesProps {
  nodes: NodesMap;
  namedNodes: NamedNodesMap;
  showOnlyNamed?: boolean; 
}


export function MapNodes({ nodes, namedNodes, showOnlyNamed = false }: MapNodesProps) {
  return (
    <>
      {Object.entries(nodes).map(([id, position]) => {
        const isNamed = !!namedNodes[id];
        const [x, y] = position;

        if (showOnlyNamed && !isNamed) {
          return null;
        }

        return (
          <Circle
            key={id}
            center={[y, x]} 
            radius={8}
            pathOptions={{
              color: isNamed ? '#00ff00' : '#ff8800',
              fillColor: isNamed ? '#00ff00' : '#ff8800',
              fillOpacity: 1,
              weight: 3
            }}
          >
            {isNamed && (
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span className="text-xs font-semibold">
                  {namedNodes[id]}
                </span>
              </Tooltip>
            )}
          </Circle>
        );
      })}
    </>
  );
}
