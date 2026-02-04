from typing import List, Dict, Any
from fastapi import HTTPException, status

from ..providers.interfaces.paciente_provider_interface import PacienteProviderInterface

async def listar_pacientes(
    provider: PacienteProviderInterface
) -> List[Dict[str, Any]]:
    return await provider.listar_pacientes()

# ← MUDANÇA AQUI: agora retorna LISTA
async def obter_paciente_por_codigo(
    codigo: int,
    provider: PacienteProviderInterface
) -> List[Dict[str, Any]]:
    consultas = await provider.obter_paciente_por_codigo(codigo)
    return consultas  # retorna a lista completa

# NOVA FUNÇÃO: usada pelo frontend para buscar destino(s)
async def buscar_destino_por_prontuario(prontuario: int, provider: PacienteProviderInterface):
    consultas = await provider.obter_paciente_por_codigo(prontuario)
    
    if not consultas:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    # Extrai todos os locais das consultas
    locais = []
    for consulta in consultas:
        destino = (
            consulta.get("Local/Consultório") or
            consulta.get("Local/Consultorio") or
            consulta.get("consultorio") or
            ""
        ).strip()
        if destino:
            locais.append(destino)

    if not locais:
        raise HTTPException(status_code=404, detail="Paciente não possui local/consulta definido")

    return {"destinos": locais}  # ← retorna array de destinos