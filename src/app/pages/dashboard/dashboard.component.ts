import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JogoService } from '../../services/jogo.service';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { JogadorService } from '../../services/jogador.service';
import { PagamentoService } from '../../services/pagamento.service';
import { FinanceiroHistoricoService } from '../../services/financeiro-historico.service';
import { AuthService } from '../../services/auth.service';
import { Jogo } from '../../models/jogo.model';
import { Jogador } from '../../models/jogador.model';

interface MesGrafico {
  label: string;
  pago: number;
  atrasado: number;
  pendente: number;
}

interface Atrasado {
  id: number;
  nome: string;
  valor: string;
  cor?: string;
  init?: string;
  posicao?: string;
}

interface HistoricoJogo {
  data: string;
  t1: string;
  p1: number | string;
  p2: number | string;
  t2: string;
  jog: string;
}

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Edição do Próximo Baba (admin)
  editandoProximo = false;
  salvandoProximo = false;
  novaData = '';
  novaHora = '';
  novoLocal = '';

  // Gestão de presenças pelo admin
  gerenciandoPresencas = false;
  presencasAdmin: Record<number, boolean> = {};

  // Placar (admin registra o resultado dos jogos agendados)
  placares = signal<Record<number, { a: number; b: number }>>({});

  buscaAtrasados = '';
  private referencia = PagamentoService.referenciaAtual();

  constructor(
    public jogoService: JogoService,
    public configuracaoService: ConfiguracaoService,
    public jogadorService: JogadorService,
    public pagamentoService: PagamentoService,
    public financeiroHistoricoService: FinanceiroHistoricoService,
    public authService: AuthService,
  ) {
    // Sempre que o "próximo jogo" mudar, recarrega o resumo de presenças
    // e a minha própria resposta (o admin pode ter alterado a data).
    effect(() => {
      const jogo = this.jogoService.proximoJogo();
      if (jogo) {
        this.jogoService.carregarResumoPresencas(jogo.id);
        this.jogoService.carregarMinhaPresenca(jogo.id);
      }
    });
  }

  ngOnInit(): void {
    this.jogoService.carregarProximoJogo();
    this.jogoService.carregarJogos();
    this.configuracaoService.carregar();
    this.jogadorService.carregarJogadores();
    this.financeiroHistoricoService.carregarHistorico();
    this.pagamentoService.carregarMes(this.referencia);

    // Jogador vinculado à conta logada (associado). Se não houver, o
    // backend responde 404 e o card "Sua situação" some — sem quebrar.
    this.jogadorService.buscarMeuJogador().subscribe({ error: () => {} });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // ---------- Cards de estatísticas ----------
  totalJogadores = computed(() => this.jogadorService.jogadores().length);
  aptos = computed(() => this.jogadorService.jogadores().filter(j => j.apto).length);

  private pagamentosMes = computed(() =>
    this.pagamentoService.pagamentos().filter(p => p.referencia === this.referencia)
  );

  mensalidadesPagas = computed(() => this.pagamentosMes().filter(p => p.status === 'Pago').length);
  mensalidadesAtrasadas = computed(() => this.pagamentosMes().filter(p => p.status === 'Atrasado').length);

  // ---------- Aviso ----------
  avisoAtivo = computed(() => !!this.configuracaoService.configuracao()?.avisoAtivo);
  avisoTexto = computed(() => this.configuracaoService.configuracao()?.aviso ?? '');

  // ---------- Próximo Baba ----------
  proximoJogo = this.jogoService.proximoJogo;

  proximoJogoData = computed(() => {
    const data = this.proximoJogo()?.data;
    return data ? this.formatarDataLonga(data) : 'Sem jogo agendado';
  });

  proximoJogoHora = computed(() => {
    const data = this.proximoJogo()?.data;
    if (!data) return '--:--';
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });

  proximoJogoLocal = computed(() => this.proximoJogo()?.local || 'Local a definir');

  confirmados = computed(() => this.jogoService.resumoPresencas()?.confirmados ?? 0);
  pendentes = computed(() => this.jogoService.resumoPresencas()?.pendentes ?? 0);
  meuStatus = computed<'yes' | 'no' | null>(() => {
    const minha = this.jogoService.minhaPresenca();
    if (minha === true) return 'yes';
    if (minha === false) return 'no';
    return null;
  });

  // ---------- Gráfico de mensalidades (histórico real) ----------
  meses = computed<MesGrafico[]>(() =>
    this.financeiroHistoricoService.historico().map(h => ({
      label: NOMES_MES[h.mes - 1] ?? String(h.mes),
      pago: h.totalPago,
      atrasado: h.totalAtrasado,
      pendente: h.totalPendente,
    }))
  );

  private maxBarra = computed(() => {
    const valores = this.meses().flatMap(m => [m.pago, m.atrasado, m.pendente]);
    return valores.length ? Math.max(...valores, 1) : 1;
  });

  barHeight(valor: number): string {
    return `${Math.round((valor / this.maxBarra()) * 100)}%`;
  }

  // ---------- Histórico (somente jogos realizados) ----------
  historicoJogos = computed<HistoricoJogo[]>(() =>
    this.jogoService.jogos()
      .filter(j => j.status === 'Realizado')
      .map(j => ({
        data: this.formatarDataCurta(j.data),
        t1: j.timeA,
        p1: j.placarA ?? 0,
        p2: j.placarB ?? 0,
        t2: j.timeB,
        jog: `${j.timeA} x ${j.timeB}`,
      }))
  );

  // Jogos ainda não realizados: é onde o admin registra o placar final.
  jogosAgendados = computed(() => this.jogoService.jogos().filter(j => j.status === 'Agendado'));

  // ---------- Inadimplentes (atrasados) ----------
  private jogadoresAtrasados = computed<Atrasado[]>(() => {
    const idsAtrasados = new Set(
      this.pagamentoService.pagamentos()
        .filter(p => p.referencia === this.referencia && p.status === 'Atrasado')
        .map(p => p.jogadorId)
    );
    const valor = this.configuracaoService.configuracao()?.valorMensalidade ?? 50;
    return this.jogadorService.jogadores()
      .filter(j => idsAtrasados.has(j.id) || j.pagamento === 'Atrasado')
      .map(j => ({
        id: j.id,
        nome: j.apelido || j.nome,
        valor: `R$ ${valor},00`,
        cor: j.cor,
        init: j.init,
        posicao: j.posicao,
      }));
  });

  get atrasadosFiltrados(): Atrasado[] {
    const termo = this.buscaAtrasados.toLowerCase().trim();
    return this.jogadoresAtrasados().filter(a => a.nome.toLowerCase().includes(termo));
  }

  // ---------- Ações ----------

  toggleMinhaAptidao(): void {
    const meu = this.jogadorService.meuJogador();
    if (!meu) return;
    this.jogadorService.marcarMinhaAptidao(!meu.apto).subscribe({
      error: () => alert('Não foi possível atualizar sua situação.')
    });
  }

  toggleRsvp(vou: boolean): void {
    const jogo = this.proximoJogo();
    if (!jogo) {
      alert('Ainda não há um baba agendado.');
      return;
    }
    this.jogoService.confirmarPresenca(jogo.id, vou).subscribe({
      error: () => alert('Não foi possível registrar sua resposta.')
    });
  }

  cobrar(atrasado: Atrasado): void {
    alert(`Cobrança enviada para ${atrasado.nome}`);
  }

  // --- Admin: editar data/hora do próximo baba ---
  iniciarEdicaoProximo(): void {
    const config = this.configuracaoService.configuracao();
    const jogo = this.proximoJogo();

    const base = jogo?.data ? new Date(jogo.data) : this.proximaDataDoDia(config?.dia, config?.horario);
    this.novaData = this.paraInputDate(base);
    this.novaHora = this.paraInputTime(base);
    this.novoLocal = jogo?.local || config?.campo || 'Campo Principal';
    this.editandoProximo = true;
  }

  cancelarEdicaoProximo(): void {
    this.editandoProximo = false;
  }

  salvarProximo(): void {
    if (!this.novaData || !this.novaHora) {
      alert('Informe a data e o horário do baba.');
      return;
    }

    const dataIso = new Date(`${this.novaData}T${this.novaHora}:00`).toISOString();
    this.salvandoProximo = true;
    const jogo = this.proximoJogo();

    const finalizar = () => {
      this.salvandoProximo = false;
      this.editandoProximo = false;
    };

    if (jogo) {
      this.jogoService.atualizarJogo(jogo.id, { data: dataIso, local: this.novoLocal }).subscribe({
        next: finalizar,
        error: () => { this.salvandoProximo = false; alert('Não foi possível salvar a nova data.'); }
      });
    } else {
      this.jogoService.criarJogo({
        data: dataIso,
        local: this.novoLocal,
        timeA: 'Time Verde',
        timeB: 'Time Amarelo',
        status: 'Agendado',
      }).subscribe({
        next: finalizar,
        error: () => { this.salvandoProximo = false; alert('Não foi possível agendar o baba.'); }
      });
    }
  }

  // --- Admin: presença de qualquer jogador no próximo jogo ---
  alternarGerenciamentoPresencas(): void {
    this.gerenciandoPresencas = !this.gerenciandoPresencas;
    if (this.gerenciandoPresencas) {
      this.presencasAdmin = {};
    }
  }

  definirPresenca(jogador: Jogador, presente: boolean): void {
    const jogo = this.proximoJogo();
    if (!jogo) return;

    this.presencasAdmin[jogador.id] = presente;
    this.jogoService.confirmarPresencaPorAdmin(jogo.id, jogador.id, presente).subscribe({
      error: () => {
        delete this.presencasAdmin[jogador.id];
        alert('Não foi possível atualizar a presença.');
      }
    });
  }

  // --- Admin: registrar placar (vira "Realizado" no histórico) ---
  placarDe(jogo: Jogo): { a: number; b: number } {
    return this.placares()[jogo.id] ?? { a: jogo.placarA ?? 0, b: jogo.placarB ?? 0 };
  }

  setPlacar(jogoId: number, campo: 'a' | 'b', valor: unknown): void {
    const atual = this.placares()[jogoId] ?? { a: 0, b: 0 };
    this.placares.update(mapa => ({ ...mapa, [jogoId]: { ...atual, [campo]: Number(valor) || 0 } }));
  }

  registrarResultado(jogo: Jogo): void {
    const placar = this.placarDe(jogo);
    this.jogoService.atualizarJogo(jogo.id, {
      status: 'Realizado',
      placarA: placar.a,
      placarB: placar.b,
    }).subscribe({
      error: () => alert('Não foi possível registrar o resultado.')
    });
  }

  // ---------- Helpers ----------
  private formatarDataLonga(iso: string): string {
    const data = new Date(iso);
    const dia = data.toLocaleDateString('pt-BR', { weekday: 'long' });
    const numero = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${dia.charAt(0).toUpperCase()}${dia.slice(1)}, ${numero}`;
  }

  private formatarDataCurta(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  private paraInputDate(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private paraInputTime(data: Date): string {
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  private proximaDataDoDia(diaTexto?: string, horario?: string): Date {
    const dias: Record<string, number> = {
      domingo: 0, segunda: 1, terça: 2, terca: 2, quarta: 3,
      quinta: 4, sexta: 5, sábado: 6, sabado: 6,
    };
    const alvo = dias[(diaTexto || '').toLowerCase().trim()] ?? 6;
    const hoje = new Date();
    let diff = alvo - hoje.getDay();
    if (diff <= 0) diff += 7;

    const [horas, minutos] = (horario || '18:00').split(':').map(Number);
    const data = new Date();
    data.setDate(hoje.getDate() + diff);
    data.setHours(horas || 18, minutos || 0, 0, 0);
    return data;
  }
}
