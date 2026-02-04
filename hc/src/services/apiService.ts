// src/services/apiService.ts

import type { Paciente } from '../types/navigation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Busca dados de um paciente pelo número do prontuário
 * Retorna Paciente ou Paciente[] (pode ter múltiplas consultas)
 */
export async function buscarPaciente(numeroProntuario: string): Promise<Paciente | Paciente[]> {
  const numero = Number(numeroProntuario);
  
  if (isNaN(numero)) {
    throw new Error('Número de prontuário inválido');
  }

  const response = await fetch(`${API_BASE_URL}/api/pacientes/${numero}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Prontuário não encontrado');
    }
    throw new Error('Erro ao buscar paciente no servidor');
  }

  const data = await response.json();
  
  console.log('📋 Dados recebidos da API:', data);
  console.log('📊 É array?', Array.isArray(data));
  console.log('📊 Quantidade:', Array.isArray(data) ? data.length : 1);
  
  // Retorna exatamente como veio da API (array ou objeto)
  return data;
}

/**
 * Normaliza texto removendo acentos e convertendo para lowercase
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Busca um local no mapa que corresponda ao texto
 * Faz matching fuzzy (aceita correspondência parcial)
 */
export function findMatchingLocation(
  searchText: string,
  namedNodes: Record<string, string>
): { key: string; name: string } | null {
  const normalized = normalizeText(searchText);
  
  console.log('🔍 Buscando local:', searchText);
  console.log('📝 Texto normalizado:', normalized);
  console.log('🗺️ Locais disponíveis:', Object.values(namedNodes));

  // Tenta match exato primeiro
  for (const [key, name] of Object.entries(namedNodes)) {
    const normalizedName = normalizeText(name);
    if (normalizedName === normalized) {
      console.log('✅ Match exato encontrado:', name);
      return { key, name };
    }
  }

  // Tenta match parcial (contém)
  for (const [key, name] of Object.entries(namedNodes)) {
    const normalizedName = normalizeText(name);
    if (normalizedName.includes(normalized) || normalized.includes(normalizedName)) {
      console.log('✅ Match parcial encontrado:', name);
      return { key, name };
    }
  }

  // Tenta match palavra por palavra
  const searchWords = normalized.split(/\s+/);
  for (const [key, name] of Object.entries(namedNodes)) {
    const normalizedName = normalizeText(name);
    const nameWords = normalizedName.split(/\s+/);
    
    // Se alguma palavra do local contém alguma palavra da busca
    for (const searchWord of searchWords) {
      if (searchWord.length < 3) continue; // Ignora palavras muito curtas
      
      for (const nameWord of nameWords) {
        if (nameWord.includes(searchWord) || searchWord.includes(nameWord)) {
          console.log('✅ Match por palavra encontrado:', name, `(palavra: "${searchWord}")`);
          return { key, name };
        }
      }
    }
  }

  console.error('❌ Nenhum local encontrado para:', searchText);
  console.error('💡 Locais disponíveis:', Object.values(namedNodes).join(', '));
  
  return null;
}
