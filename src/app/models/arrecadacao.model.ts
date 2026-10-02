export interface ArrecadacaoMensal {
  id: number;
  ano: number;
  mes: number;
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
  valorArrecadado: number;
  criadoEm: string;
}
