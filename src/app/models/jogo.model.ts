export interface Jogo {
  id: number;
  data: string;
  local: string;
  status: 'Agendado' | 'Realizado' | 'Cancelado';
  timeA: string;
  timeB: string;
  jogadoresTimeA: string[];
  jogadoresTimeB: string[];
  placarA: number | null;
  placarB: number | null;
  criadoEm: string;
}

export interface CriarJogoPayload {
  data: string;
  local?: string;
  timeA?: string;
  timeB?: string;
  jogadoresTimeA?: string[];
  jogadoresTimeB?: string[];
  status?: Jogo['status'];
}
