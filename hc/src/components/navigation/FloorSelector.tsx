import { MdLayers } from 'react-icons/md';

interface FloorSelectorProps {
  floors: Map<number, { floorNumber: number; floorName: string }>;
  currentFloor: number;
  onFloorChange: (floor: number) => void;
}

/**
 * Componente para seleção de andares
 */
export function FloorSelector({ floors, currentFloor, onFloorChange }: FloorSelectorProps) {
  if (floors.size <= 1) return null;

  const sortedFloors = Array.from(floors.values()).sort((a, b) => b.floorNumber - a.floorNumber);

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <MdLayers className="text-blue-600 w-5 h-5" />
        <span className="text-sm font-semibold text-slate-700">Andares</span>
      </div>

      <div className="flex flex-col gap-2">
        {sortedFloors.map((floor) => (
          <button
            key={floor.floorNumber}
            onClick={() => onFloorChange(floor.floorNumber)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              currentFloor === floor.floorNumber
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {floor.floorName}
          </button>
        ))}
      </div>
    </div>
  );
}
