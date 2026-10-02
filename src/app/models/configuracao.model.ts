export interface ConfiguracaoBaba {
  id: number;
  nome: string;
  historia: string;
  campo: string;
  endereco: string;
  dia: string;
  horario: string;
  duracao: string;
  formato: string;
  logoUrl: string | null;
  corPrimaria: string;
  corSecundaria: string;
  aviso: string;
  avisoAtivo: boolean;
  valorMensalidade: number;
  diaVencimento: number;
  diasTolerancia: number;
  atualizadoEm: string;
}

export type UpdateConfiguracaoPayload = Partial<
  Omit<ConfiguracaoBaba, 'id' | 'logoUrl' | 'atualizadoEm'>
>;
