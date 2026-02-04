import pandas as pd
from typing import List, Dict, Any
from fastapi import HTTPException, status

from ..interfaces.paciente_provider_interface import PacienteProviderInterface


class PacienteCsvProvider(PacienteProviderInterface):
    def __init__(self, csv_path: str = 'data/pacientes.csv'):
        try:
            self.df = pd.read_csv(csv_path)

            # Garante que a coluna Prontuário seja do tipo inteiro
            self.df['Prontuário'] = self.df['Prontuário'].astype(int)
        except FileNotFoundError:
            raise RuntimeError(f"Arquivo CSV de pacientes não encontrado em: {csv_path}")

    async def listar_pacientes(self) -> List[Dict[str, Any]]:
        """Retorna todos os pacientes do CSV."""
        return self.df.to_dict(orient='records')

    async def obter_paciente_por_codigo(self, codigo: int) -> List[Dict[str, Any]]:
        """
        Retorna TODAS as consultas/agendamentos do paciente com o prontuário informado.
        Um paciente pode ter múltiplas linhas no CSV (ex: duas consultas no mesmo dia).
        """
        paciente_df = self.df[self.df['Prontuário'] == codigo]
        
        if paciente_df.empty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente não encontrado no CSV"
            )

        # Retorna uma LISTA com todas as consultas do paciente
        return paciente_df.to_dict(orient='records')