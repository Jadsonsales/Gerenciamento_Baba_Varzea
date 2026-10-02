export interface Notificacao {
  id: number;
  tipo: 'jogador' | 'pagamento' | 'sorteio' | 'aviso';
  texto: string;
  criadoEm: string;
  lida: boolean;
}
