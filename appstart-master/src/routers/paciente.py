from fastapi import APIRouter, Depends
from typing import List, Dict

from ..controllers import paciente_controller
from ..dependencies import get_paciente_provider
from ..providers.interfaces.paciente_provider_interface import PacienteProviderInterface

from ..auth.auth import auth_handler

# --- CONFIGURAÇÃO DO PROVIDER (CSV ou Postgres) ---
STRATEGY = "csv"  # Mude para "postgres" quando for usar o banco real
# ----------------------------------------------------

router = APIRouter(
    prefix="/api/pacientes",
    tags=["Pacientes"],
    #dependencies=[Depends(auth_handler.decode_token)]  # Descomente quando tiver autenticação
)

# Lista todos os pacientes
@router.get("", response_model=List[Dict])
async def listar_pacientes(
    provider: PacienteProviderInterface = Depends(get_paciente_provider(STRATEGY))
):
    """Lista todos os pacientes da fonte de dados configurada."""
    return await paciente_controller.listar_pacientes(provider)

# Busca TODAS as consultas de um paciente pelo prontuário
@router.get("/{codigo}", response_model=List[Dict])
async def obter_paciente(
    codigo: int,
    provider: PacienteProviderInterface = Depends(get_paciente_provider(STRATEGY))
):
    """Retorna TODAS as consultas/agendamentos do paciente com o prontuário informado."""
    return await paciente_controller.obter_paciente_por_codigo(codigo, provider)