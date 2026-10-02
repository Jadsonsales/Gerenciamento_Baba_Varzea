export type StatusPagamento = 'Pago' | 'Pendente' | 'Atrasado';

export interface Pagamento {
  id: number;
  jogadorId: number;
  valor: number;
  // Formato "YYYY-MM" (ex: "2026-09").
  referencia: string;
  status: StatusPagamento;
  pagoEm: string | null;
  criadoEm: string;
  jogador?: {
    id: number;
    apelido: string;
    nome: string;
    num: string;
    posicao: string;
  };
}

export interface CriarPagamentoPayload {
  jogadorId: number;
  valor?: number;
  referencia?: string;
  status?: StatusPagamento;
}

export interface AtualizarPagamentoPayload {
  valor?: number;
  referencia?: string;
  status?: StatusPagamento;
}
