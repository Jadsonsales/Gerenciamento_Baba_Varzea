import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { JogadorService } from '../../services/jogador.service';
import { JogoService } from '../../services/jogo.service';

@Component({
  selector: 'app-sorteio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sorteio.component.html',
  styleUrls: ['./sorteio.component.css'],
})
export class SorteioComponent implements OnInit {
  passo = 1;
  modo = 'baba';
  selecionados: number[] = [];
  resultado: any = null;
  jogoSalvo = false;
  salvando = false;

  // Nomes customizados para o modo Clássico
  time1Nome = 'Time Colete';
  time2Nome = 'Time Sem Colete';

  constructor(
    private auth: AuthService,
    private jogadorService: JogadorService,
    private jogoService: JogoService,
  ) {}

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.jogadorService.carregarJogadores();
  }

  // Todos os jogadores ativos ficam disponíveis para a seleção (um
  // jogador recém-cadastrado aparece aqui na hora, sem recarregar).
  // Por padrão, só os marcados como "apto" já vêm selecionados.
  elegiveis = computed(() => this.jogadorService.jogadores().filter(j => j.status === 'Ativo'));

  selecionarModo(m: string) {
    this.modo = m;
    this.passo = 2;
    this.selecionados = this.elegiveis().filter(j => j.apto).map(j => j.id);
  }

  toggleJog(id: number) {
    const i = this.selecionados.indexOf(id);
    if (i > -1) {
      this.selecionados.splice(i, 1);
    } else {
      this.selecionados.push(id);
    }
  }

  sortear() {
    const jogsSel = this.elegiveis().filter(j => this.selecionados.includes(j.id));
    const shuffled = [...jogsSel].sort(() => Math.random() - 0.5);

    if (this.modo === 'copao') {
      // Divide em 4 times para o modo Copão
      const numTimes = 4;
      this.resultado = Array.from({ length: numTimes }, (_, idx) => ({
        nome: `Time ${idx + 1}`,
        jogadores: [] as typeof shuffled
      }));

      shuffled.forEach((jogador, idx) => {
        this.resultado[idx % numTimes].jogadores.push(jogador);
      });
    } else {
      // Modo Baba 1x2 ou Clássico (divisão em 2 times)
      const meio = Math.ceil(shuffled.length / 2);
      const nomeA = this.modo === 'classico' ? this.time1Nome : 'Baba 1';
      const nomeB = this.modo === 'classico' ? this.time2Nome : 'Baba 2';

      this.resultado = [
        { nome: nomeA, jogadores: shuffled.slice(0, meio) },
        { nome: nomeB, jogadores: shuffled.slice(meio) }
      ];
    }

    this.jogoSalvo = false;
    this.passo = 3;
  }

  salvarResultado(): void {
    if (!this.resultado || this.resultado.length < 2) return;
    this.salvando = true;

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(18, 0, 0, 0);

    this.jogoService.criarJogo({
      data: amanha.toISOString(),
      timeA: this.resultado[0].nome,
      timeB: this.resultado[1].nome,
      jogadoresTimeA: this.resultado[0].jogadores.map((j: any) => j.apelido),
      jogadoresTimeB: this.resultado[1].jogadores.map((j: any) => j.apelido),
      status: 'Agendado',
    }).subscribe({
      next: () => {
        this.salvando = false;
        this.jogoSalvo = true;
      },
      error: () => {
        this.salvando = false;
        alert('Não foi possível salvar o resultado no Dashboard.');
      }
    });
  }

  novaSorteio() {
    this.resultado = null;
    this.selecionados = [];
    this.jogoSalvo = false;
    this.passo = 1;
  }
}