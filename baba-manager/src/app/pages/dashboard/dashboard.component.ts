import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface MesFinanceiro {
  label: string;
  pago: number;
  atrasado: number;
  pendente: number;
}

interface Jogo {
  data: string;
  t1: string;
  p1: number;
  p2: number;
  t2: string;
  jog: number;
}

interface JogadorAtrasado {
  nome: string;
  pos: string;
  init: string;
  cor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent {
  totalJogadores = 20;
  aptos = 13;
  mensalidadesPagas = 18;
  mensalidadesAtrasadas = 4;

  proximoJogo = {
    data: 'SÁBADO, 15 JUL 2026',
    hora: '18:00',
    local: 'Campo das Barreiras',
  };

  confirmados = 22;
  pendentes = 8;
  meuStatus: 'yes' | 'no' | null = null;

  meses: MesFinanceiro[] = [
    { label: 'Jan', pago: 8, atrasado: 1, pendente: 1 },
    { label: 'Fev', pago: 9, atrasado: 0, pendente: 1 },
    { label: 'Mar', pago: 7, atrasado: 2, pendente: 1 },
    { label: 'Abr', pago: 10, atrasado: 1, pendente: 0 },
    { label: 'Mai', pago: 8, atrasado: 2, pendente: 2 },
    { label: 'Jun', pago: 14, atrasado: 4, pendente: 2 },
  ];

  jogos: Jogo[] = [
    { data: '22/07', t1: 'Verde', p1: 5, p2: 3, t2: 'Amarelo', jog: 12 },
    { data: '15/07', t1: 'Azul', p1: 2, p2: 2, t2: 'Vermelho', jog: 11 },
    { data: '08/07', t1: 'Verde', p1: 6, p2: 4, t2: 'Azul', jog: 12 },
    { data: '01/07', t1: 'Amarelo', p1: 3, p2: 5, t2: 'Vermelho', jog: 10 },
  ];

  atrasados: JogadorAtrasado[] = [
    { nome: 'Carlos Silva', pos: 'Zagueiro', init: 'CS', cor: '#8b5cf6' },
    { nome: 'João Pedro', pos: 'Atacante', init: 'JP', cor: '#e14b4a' },
    { nome: 'Rafael Souza', pos: 'Meio-campo', init: 'RS', cor: '#12a24a' },
    { nome: 'Bruno Lima', pos: 'Goleiro', init: 'BL', cor: '#f2b100' },
  ];

  buscaAtrasados = '';

  sorteioAberto = false;
  sorteando = false;
  timeVerde: string[] = [];
  timeAmarelo: string[] = [];

  get atrasadosFiltrados(): JogadorAtrasado[] {
    const q = this.buscaAtrasados.toLowerCase().trim();
    if (!q) return this.atrasados;
    return this.atrasados.filter((a) => a.nome.toLowerCase().includes(q));
  }

  barHeight(valor: number): string {
    return `${valor * 9}px`;
  }

  toggleRsvp(vou: boolean): void {
    if (this.meuStatus === 'yes') this.confirmados--;
    if (this.meuStatus === 'no') this.pendentes++;

    this.meuStatus = vou ? 'yes' : 'no';

    if (vou) {
      this.confirmados++;
    } else {
      this.pendentes = Math.max(this.pendentes - 1, 0);
    }
  }

  cobrar(jogador: JogadorAtrasado): void {
    console.log(`Cobrança enviada para ${jogador.nome}`);
  }

  abrirSorteio(): void {
    this.sorteioAberto = true;
    this.timeVerde = [];
    this.timeAmarelo = [];
  }

  fecharSorteio(): void {
    this.sorteioAberto = false;
  }

  sortearTimes(): void {
    this.sorteando = true;
    const nomes = [
      'Carlos', 'João', 'Rafael', 'Bruno', 'Diego', 'Lucas',
      'Thiago', 'Vitor', 'André', 'Felipe', 'Gustavo', 'Marcos',
    ];
    const embaralhados = [...nomes].sort(() => Math.random() - 0.5);

    setTimeout(() => {
      this.timeVerde = embaralhados.slice(0, 6);
      this.timeAmarelo = embaralhados.slice(6, 12);
      this.sorteando = false;
    }, 900);
  }
}