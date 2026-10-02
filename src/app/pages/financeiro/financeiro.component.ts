import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JogadorService } from '../../services/jogador.service';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { FinanceiroHistoricoService } from '../../services/financeiro-historico.service';
import { PagamentoService } from '../../services/pagamento.service';
import { AuthService } from '../../services/auth.service';
import { Jogador } from '../../models/jogador.model';
import { StatusPagamento } from '../../models/pagamento.model';

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface LinhaFinanceiro extends Jogador {
  pagamentoId: number | null;
  valorPago: number;
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.css']
})
export class FinanceiroComponent implements OnInit {
  gerandoSnapshot = false;
  private referencia = PagamentoService.referenciaAtual();

  constructor(
    public jogadorService: JogadorService,
    public configuracaoService: ConfiguracaoService,
    public financeiroHistoricoService: FinanceiroHistoricoService,
    public pagamentoService: PagamentoService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.jogadorService.carregarJogadores();
    this.configuracaoService.carregar();
    this.financeiroHistoricoService.carregarHistorico();

    // Garante que todo jogador Ativo tenha o lançamento do mês (Pendente)
    // e só então carrega a lista — assim um jogador recém-cadastrado já
    // aparece aqui sem precisar de nenhum passo manual.
    if (this.authService.isAdmin()) {
      this.pagamentoService.gerarMes().subscribe({
        next: () => this.pagamentoService.carregarMes(this.referencia),
        error: () => this.pagamentoService.carregarMes(this.referencia),
      });
    } else {
      this.pagamentoService.carregarMes(this.referencia);
    }
  }

  historico = computed(() =>
    this.financeiroHistoricoService.historico().map(h => ({
      l: NOMES_MES[h.mes - 1],
      v: h.totalPago,
    }))
  );

  gerarSnapshot(): void {
    this.gerandoSnapshot = true;
    this.financeiroHistoricoService.gerarSnapshotAgora().subscribe({
      next: () => { this.gerandoSnapshot = false; },
      error: () => { this.gerandoSnapshot = false; alert('Não foi possível gerar o snapshot agora.'); }
    });
  }

  valorMensalidade = computed(() => this.configuracaoService.configuracao()?.valorMensalidade ?? 50);

  // Mapa jogadorId -> lançamento do mês de referência.
  private pagamentoPorJogador = computed(() => {
    const mapa = new Map<number, { id: number; status: StatusPagamento; valor: number }>();
    for (const p of this.pagamentoService.pagamentos()) {
      if (p.referencia === this.referencia) {
        mapa.set(p.jogadorId, { id: p.id, status: p.status, valor: p.valor });
      }
    }
    return mapa;
  });

  // Lista exibida na tabela: um jogador por linha, com o status da
  // mensalidade do mês (Pendente quando ainda não há lançamento).
  linhas = computed<LinhaFinanceiro[]>(() => {
    const mapa = this.pagamentoPorJogador();
    return this.jogadorService.jogadores().map(j => {
      const pag = mapa.get(j.id);
      return {
        ...j,
        pagamento: pag?.status ?? 'Pendente',
        pagamentoId: pag?.id ?? null,
        valorPago: pag?.valor ?? this.valorMensalidade(),
      };
    });
  });

  totalPago = computed(() => this.linhas().filter(j => j.pagamento === 'Pago').length);
  totalPendente = computed(() => this.linhas().filter(j => j.pagamento === 'Pendente').length);
  totalAtrasado = computed(() => this.linhas().filter(j => j.pagamento === 'Atrasado').length);

  caixaMesAtual = computed(() =>
    this.linhas().filter(j => j.pagamento === 'Pago').reduce((soma, j) => soma + j.valorPago, 0)
  );
  aReceber = computed(() =>
    this.linhas().filter(j => j.pagamento !== 'Pago').reduce((soma, j) => soma + j.valorPago, 0)
  );

  percentualEmDia = computed(() => {
    const total = this.linhas().length;
    return total === 0 ? 0 : Math.round((this.totalPago() / total) * 100);
  });

  // Arcos do gráfico de rosca calculados a partir dos números reais.
  // Circunferência do círculo de raio 48 (mesmo do template): 2 * PI * 48.
  private readonly circunferencia = 2 * Math.PI * 48;

  donut = computed(() => {
    const total = this.linhas().length || 1;
    const arco = (n: number) => Math.round((n / total) * this.circunferencia);
    const verde = arco(this.totalPago());
    const amarelo = arco(this.totalPendente());
    const vermelho = arco(this.totalAtrasado());
    const circ = Math.round(this.circunferencia);

    return {
      verde: { dash: `${verde} ${circ - verde}`, offset: 0 },
      amarelo: { dash: `${amarelo} ${circ - amarelo}`, offset: -verde },
      vermelho: { dash: `${vermelho} ${circ - vermelho}`, offset: -(verde + amarelo) },
    };
  });

  // Marcar/desmarcar pago. Alterna entre Pago e Pendente e persiste no
  // lançamento (por ID). Se o jogador ainda não tem lançamento do mês,
  // cria um agora — o backend faz upsert por (jogadorId, referencia).
  alternarStatusPagamento(jogador: LinhaFinanceiro): void {
    const novoStatus: StatusPagamento = jogador.pagamento === 'Pago' ? 'Pendente' : 'Pago';

    const aoConcluir = () => {
      // Recarrega o espelho `pagamento` do jogador (usado no Dashboard e
      // na lista de Cansados) pra tudo refletir na hora.
      this.jogadorService.carregarJogadores();
    };

    if (jogador.pagamentoId) {
      this.pagamentoService.atualizar(jogador.pagamentoId, { status: novoStatus }).subscribe({
        next: aoConcluir,
        error: () => alert('Não foi possível alterar o status de pagamento.')
      });
    } else {
      this.pagamentoService.criar({
        jogadorId: jogador.id,
        referencia: this.referencia,
        status: novoStatus,
      }).subscribe({
        next: aoConcluir,
        error: () => alert('Não foi possível alterar o status de pagamento.')
      });
    }
  }

  marcarPago(jogador: LinhaFinanceiro): void {
    this.alternarStatusPagamento(jogador);
  }
}
