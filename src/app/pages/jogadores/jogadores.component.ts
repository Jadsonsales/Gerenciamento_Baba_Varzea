import { Component, computed, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Jogador } from '../../models/jogador.model';
import { JogadorService } from '../../services/jogador.service';

@Component({
  selector: 'app-jogadores',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrls: ['./jogadores.component.css'],
  templateUrl: './jogadores.component.html'
})
export class JogadoresComponent implements OnInit, AfterViewInit, OnDestroy {
  // Referência ao wrapper do modal no template (ver HTML: #modalPortal)
  @ViewChild('modalPortal') modalPortal!: ElementRef<HTMLElement>;

  busca = ''; filtroPosicao = ''; filtroStatus = ''; showModal = false;
  posicoes = ['Goleiro', 'Lateral Direito', 'Lateral Esquerdo', 'Zagueiro', 'Volante', 'Meio-Campista', 'Meia Atacante', 'Atacante', 'Ponta'];

  novo = { apelido: '', nome: '', num: '', posicao: 'Atacante', status: 'Ativo' };

  // Antes era um array hardcoded aqui dentro. Agora é o mesmo signal que
  // vive no JogadorService — qualquer outra tela que injete o service
  // (dashboard, financeiro etc.) vê a lista sempre atualizada.
  jogadores = this.jogadorService.jogadores;
  carregando = this.jogadorService.carregando;
  erro = this.jogadorService.erro;

  filteredJogadores = computed(() => {
    const termo = this.busca.toLowerCase().trim();
    return this.jogadores().filter(j =>
      (j.apelido.toLowerCase().includes(termo) || j.nome.toLowerCase().includes(termo)) &&
      (!this.filtroPosicao || j.posicao === this.filtroPosicao) &&
      (!this.filtroStatus || j.status === this.filtroStatus)
    );
  });

  totalAptos = computed(() => this.jogadores().filter(j => j.apto).length);

  constructor(private renderer: Renderer2, private jogadorService: JogadorService) {}

  ngOnInit(): void {
    // Antes o array já vinha pronto (hardcoded). Agora buscamos na API
    // assim que a tela abre. Enquanto o backend não existe, isso vai
    // cair no catchError do service e popular `erro` — é esperado.
    this.jogadorService.carregarJogadores();
  }

  // FIX: move o wrapper do modal para o <body>. Isso evita que o modal
  // fique "preso"/cortado dentro de um pai com overflow:hidden ou transform,
  // que é a causa mais comum do modal "não funcionar" (o fundo escurece
  // mas a caixa não aparece / não recebe cliques).
  ngAfterViewInit(): void {
    if (this.modalPortal?.nativeElement) {
      this.renderer.appendChild(document.body, this.modalPortal.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.modalPortal?.nativeElement?.parentNode) {
      this.modalPortal.nativeElement.parentNode.removeChild(this.modalPortal.nativeElement);
    }
  }

  trackById(index: number, item: Jogador): number {
    return item.id;
  }

  abrirModal(): void {
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
  }

  addJogador() {
    if (!this.novo.apelido || !this.novo.apelido.trim()) {
      alert('O campo Apelido é obrigatório!');
      return;
    }

    const payload = {
      apelido: this.novo.apelido.trim(),
      nome: this.novo.nome.trim() || this.novo.apelido.trim(),
      num: this.novo.num || '00',
      posicao: this.novo.posicao,
      status: this.novo.status
    };

    // Antes: this.jogadores.update(lista => [...lista, novoJogador]) direto
    // no array local — o dado sumia ao dar F5.
    // Agora: manda pro backend criar de verdade; o service já atualiza o
    // signal `jogadores` sozinho quando a resposta chega (ver tap() no
    // criarJogador do JogadorService).
    this.jogadorService.criarJogador(payload).subscribe({
      next: () => {
        this.novo = { apelido: '', nome: '', num: '', posicao: 'Atacante', status: 'Ativo' };
        this.fecharModal();
      },
      error: () => {
        // this.erro (signal do service) já foi preenchido com a mensagem;
        // o template pode exibir this.erro() num alerta/banner.
        alert('Não foi possível cadastrar o jogador. Verifique se a API está no ar.');
      }
    });
  }

  // Admin marca/desmarca a aptidão de qualquer jogador (diferente do
  // "marcarMinhaAptidao" que é o associado mexendo no próprio registro).
  toggleApto(jogador: Jogador): void {
    this.jogadorService.atualizarJogador(jogador.id, { apto: !jogador.apto }).subscribe({
      error: () => alert('Não foi possível atualizar a aptidão desse jogador.')
    });
  }

  confirmarExclusao(jogador: Jogador): void {
    const ok = confirm(`Excluir ${jogador.apelido || jogador.nome}? Essa ação não pode ser desfeita.`);
    if (!ok) return;

    this.jogadorService.removerJogador(jogador.id).subscribe({
      error: () => alert('Não foi possível excluir esse jogador.')
    });
  }
}