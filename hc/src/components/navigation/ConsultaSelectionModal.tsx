import { MdClose, MdLocationOn, MdCalendarToday, MdPerson, MdAccessTime } from 'react-icons/md';
import type { Paciente } from '../../types/navigation';

interface ConsultaSelectionModalProps {
  consultas: Paciente[];
  onSelect: (consulta: Paciente) => void;
  onClose: () => void;
}


export function ConsultaSelectionModal({ consultas, onSelect, onClose }: ConsultaSelectionModalProps) {
  const formatDate = (dateStr: string) => {
    try {
      const [date, time] = dateStr.split(' ');
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year} às ${time}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Selecione a Consulta</h2>
            <p className="text-blue-100 mt-1">
              {consultas[0]?.Nome} - Prontuário {consultas[0]?.Prontuário}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-slate-600 mb-6">
            Este paciente possui <strong>{consultas.length} consultas</strong> agendadas. 
            Selecione para qual você deseja ir:
          </p>

          <div className="space-y-4">
            {consultas.map((consulta, index) => (
              <button
                key={index}
                onClick={() => onSelect(consulta)}
                className="w-full text-left bg-white border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg rounded-xl p-6 transition group"
              >
                <div className="flex items-start gap-4">
                  
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 group-hover:bg-blue-600 rounded-full flex items-center justify-center transition">
                    <span className="text-xl font-bold text-blue-600 group-hover:text-white transition">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1">
                    
                    <div className="flex items-center gap-2 mb-3">
                      <MdLocationOn className="w-6 h-6 text-red-500" />
                      <span className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition">
                        {consulta['Local/Consultório']}
                        {consulta.Sala && ` - Sala ${consulta.Sala}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      
                      <div className="flex items-start gap-2">
                        <MdCalendarToday className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Data/Hora</div>
                          <div className="text-sm text-slate-700">
                            {formatDate(consulta['Data/Hora Início'])}
                          </div>
                        </div>
                      </div>

                      {consulta['Data/Hora Fim'] && (
                        <div className="flex items-start gap-2">
                          <MdAccessTime className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <div className="text-xs text-slate-500 font-medium">Até</div>
                            <div className="text-sm text-slate-700">
                              {consulta['Data/Hora Fim'].split(' ')[1]}
                            </div>
                          </div>
                        </div>
                      )}


                      {consulta['Médico/Profissional'] && (
                        <div className="flex items-start gap-2">
                          <MdPerson className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <div className="text-xs text-slate-500 font-medium">Profissional</div>
                            <div className="text-sm text-slate-700">
                              {consulta['Médico/Profissional']}
                            </div>
                          </div>
                        </div>
                      )}


                      {consulta.Especialidade && (
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center text-slate-400 mt-0.5">
                            📋
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 font-medium">Especialidade</div>
                            <div className="text-sm text-slate-700">
                              {consulta.Especialidade}
                            </div>
                          </div>
                        </div>
                      )}


                      {consulta.Procedimento && (
                        <div className="flex items-start gap-2 col-span-2">
                          <div className="w-5 h-5 flex items-center justify-center text-slate-400 mt-0.5">
                            🏥
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 font-medium">Procedimento</div>
                            <div className="text-sm text-slate-700">
                              {consulta.Procedimento}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status */}
                      {consulta['Status Consulta'] && (
                        <div className="flex items-start gap-2 col-span-2">
                          <div className="w-5 h-5 flex items-center justify-center text-slate-400 mt-0.5">
                            ℹ️
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 font-medium">Status</div>
                            <div className="text-sm font-semibold text-green-600">
                              {consulta['Status Consulta']}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Número da Consulta */}
                    {consulta['N° Consulta'] && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                          N° Consulta: <strong className="text-slate-700">{consulta['N° Consulta']}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Seta */}
                  <div className="flex-shrink-0 text-slate-300 group-hover:text-blue-600 transition text-2xl">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
