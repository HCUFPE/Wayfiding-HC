import type { NodeKey, NamedNodesMap, InstructionsMap } from '../../types/navigation';
import { detectFloorChanges } from '../../services/floorUtils';
import { MdStairs, MdElevator, MdStraight, MdPlace } from 'react-icons/md';

interface PathInstructionsProps {
  path: NodeKey[];
  namedNodes: NamedNodesMap;
  nodeInstructions: InstructionsMap;
}

/**
 * Exibe instruções passo-a-passo da rota
 */
export function PathInstructions({ path, namedNodes, nodeInstructions }: PathInstructionsProps) {
  if (path.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500">
        Nenhuma rota calculada
      </div>
    );
  }

  // Detecta mudanças de andar
  const floorChanges = detectFloorChanges(path, namedNodes, nodeInstructions);
  const floorChangeKeys = new Set(floorChanges.map(fc => fc.nodeKey));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <MdPlace className="text-blue-600" />
        Instruções de Navegação
      </h3>

      {/* Alerta de mudança de andar */}
      {floorChanges.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
            {floorChanges[0].type === 'elevator' ? (
              <MdElevator className="w-5 h-5" />
            ) : (
              <MdStairs className="w-5 h-5" />
            )}
            ⚠️ Atenção: Esta rota envolve mudança de andar
          </div>
          <div className="text-sm text-amber-700">
            Você precisará usar {floorChanges.length === 1 ? 'a' : 'as'} {' '}
            {floorChanges.map(fc => fc.type === 'elevator' ? 'elevador' : 'escada').join(' ou ')}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {path.map((nodeKey, index) => {
          const nodeName = namedNodes[nodeKey];
          const instruction = nodeInstructions[nodeKey];
          const isFirst = index === 0;
          const isLast = index === path.length - 1;
          const isFloorChange = floorChangeKeys.has(nodeKey);
          const floorChange = floorChanges.find(fc => fc.nodeKey === nodeKey);

          return (
            <div
              key={nodeKey}
              className={`flex items-start gap-3 p-3 rounded-lg transition ${
                isLast
                  ? 'bg-green-50 border-2 border-green-300'
                  : isFloorChange
                  ? 'bg-amber-50 border-2 border-amber-300'
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {/* Número do passo */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isLast
                    ? 'bg-green-600 text-white'
                    : isFloorChange
                    ? 'bg-amber-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {index + 1}
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                {isFirst && (
                  <div className="text-sm font-semibold text-blue-600 mb-1">
                    🏁 Ponto de Partida
                  </div>
                )}

                {isLast && (
                  <div className="text-sm font-semibold text-green-600 mb-1">
                    🎯 Destino
                  </div>
                )}

                {isFloorChange && !isFirst && !isLast && (
                  <div className="text-sm font-semibold text-amber-600 mb-1 flex items-center gap-1">
                    {floorChange?.type === 'elevator' ? (
                      <><MdElevator className="w-4 h-4" /> Elevador</>
                    ) : (
                      <><MdStairs className="w-4 h-4" /> Escada</>
                    )}
                  </div>
                )}

                {/* Nome do local */}
                {nodeName && (
                  <div className="font-bold text-slate-800 mb-1">
                    {nodeName}
                  </div>
                )}

                {/* Instrução personalizada */}
                {instruction && (
                  <div className={`text-sm italic ${isFloorChange ? 'text-amber-700 font-semibold' : 'text-slate-600'}`}>
                    💡 {instruction}
                  </div>
                )}

                {/* Instrução padrão se não tiver personalizada */}
                {!instruction && !isLast && (
                  <div className="text-sm text-slate-500">
                    {index === 0 ? 'Comece aqui' : 'Continue em frente'}
                  </div>
                )}

                {isLast && !instruction && (
                  <div className="text-sm text-green-600 font-semibold">
                    Você chegou ao destino!
                  </div>
                )}
              </div>

              {/* Ícone de direção */}
              {!isLast && (
                <div className={isFloorChange ? 'text-amber-500' : 'text-slate-400'}>
                  {isFloorChange ? (
                    floorChange?.type === 'elevator' ? (
                      <MdElevator className="w-5 h-5" />
                    ) : (
                      <MdStairs className="w-5 h-5" />
                    )
                  ) : (
                    <MdStraight className="w-5 h-5" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumo */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="text-sm text-slate-600 text-center">
          <span className="font-semibold">{path.length}</span> pontos no caminho
          {floorChanges.length > 0 && (
            <span className="ml-2 text-amber-600">
              • {floorChanges.length} mudança{floorChanges.length > 1 ? 's' : ''} de andar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
