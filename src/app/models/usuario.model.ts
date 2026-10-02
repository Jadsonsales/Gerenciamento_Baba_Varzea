export interface MinhaConta {
  id: number;
  nome: string;
  email: string;
  tel: string;
  role: 'ADMIN' | 'USER';
  prefAvisoMensalidade: boolean;
  prefAlertaAtraso: boolean;
  prefConfirmacaoPresenca: boolean;
  prefResultadoSorteio: boolean;
}

export type UpdateMinhaContaPayload = Partial<Omit<MinhaConta, 'id' | 'email' | 'role'>>;
