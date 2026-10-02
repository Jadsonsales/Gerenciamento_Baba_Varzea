export interface Jogador {
  id: number;
  init: string;
  nome: string;
  apelido: string;
  num: string;
  posicao: string;
  status: string;
  pagamento: string;
  apto: boolean;
  jogos: number;
  gols: number;
  assist: number;
  cor: string;
  usuarioId?: number | null;
}

// Formato usado no formulário de cadastro (ainda não tem id, jogos, gols etc.
// isso é preenchido pelo backend/serviço na criação).
export type NovoJogador = Pick<Jogador, 'apelido' | 'nome' | 'num' | 'posicao' | 'status'>;
