import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Jogador {
  id: number; init: string; nome: string; apelido: string; num: string;
  posicao: string; status: string; pagamento: string; apto: boolean;
  jogos: number; gols: number; assist: number; cor: string;
}

@Component({
  selector: 'app-jogadores',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrls: ['./jogadores.component.css'],
  templateUrl: './jogadores.component.html'
})
export class JogadoresComponent {
  busca = ''; filtroPosicao = ''; filtroStatus = ''; showModal = false;
  posicoes = ['Goleiro', 'Lateral Direito', 'Lateral Esquerdo', 'Zagueiro', 'Volante', 'Meio-Campista', 'Meia Atacante', 'Atacante', 'Ponta'];
  novo = { apelido: '', nome: '', num: '', posicao: 'Atacante', status: 'Ativo' };

  // 1. TRANSFORMADO EM SIGNAL
  jogadores = signal<Jogador[]>([
    { id: 1, init: 'CE', nome: 'Carlos Eduardo Santos', apelido: 'Carlão', num: '10', posicao: 'Meio-Campista', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 24, gols: 12, assist: 8, cor: '#2ecc71' },
    { id: 2, init: 'RA', nome: 'Roberto Alves Lima', apelido: 'Beto', num: '9', posicao: 'Atacante', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 22, gols: 18, assist: 5, cor: '#e53935' },
    { id: 3, init: 'MV', nome: 'Marcos Vinicius Costa', apelido: 'Marquinho', num: '7', posicao: 'Ponta', status: 'Ativo', pagamento: 'Atrasado', apto: false, jogos: 20, gols: 7, assist: 11, cor: '#e67e22' },
    { id: 4, init: 'FR', nome: 'Felipe Rodrigues Souza', apelido: 'Felipão', num: '1', posicao: 'Goleiro', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 26, gols: 0, assist: 1, cor: '#9b59b6' },
    { id: 5, init: 'DF', nome: 'Diego Ferreira Neto', apelido: 'Diegão', num: '4', posicao: 'Zagueiro', status: 'Ativo', pagamento: 'Pendente', apto: false, jogos: 18, gols: 3, assist: 2, cor: '#1abc9c' },
    { id: 6, init: 'RS', nome: 'Rafael Sousa Mendes', apelido: 'Rafa', num: '11', posicao: 'Meia Atacante', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 23, gols: 9, assist: 14, cor: '#e74c3c' },
    { id: 7, init: 'TB', nome: 'Thiago Barbosa Cruz', apelido: 'Thiagão', num: '6', posicao: 'Volante', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 21, gols: 4, assist: 6, cor: '#3498db' },
    { id: 8, init: 'AP', nome: 'Anderson Pereira Dias', apelido: 'Andinho', num: '3', posicao: 'Lateral Esquerdo', status: 'Ativo', pagamento: 'Atrasado', apto: false, jogos: 15, gols: 1, assist: 9, cor: '#27ae60' },
    { id: 9, init: 'LO', nome: 'Lucas Oliveira Silva', apelido: 'Lucão', num: '5', posicao: 'Zagueiro', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 25, gols: 2, assist: 3, cor: '#2980b9' },
    { id: 10, init: 'GM', nome: 'Gabriel Martins Rocha', apelido: 'Gabizinho', num: '8', posicao: 'Meio-Campista', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 19, gols: 6, assist: 7, cor: '#8e44ad' },
    { id: 11, init: 'PH', nome: 'Paulo Henrique Gomes', apelido: 'PH', num: '2', posicao: 'Lateral Direito', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 22, gols: 2, assist: 5, cor: '#e67e22' },
    { id: 12, init: 'MF', nome: 'Mateus Ferreira Pinto', apelido: 'Matezão', num: '13', posicao: 'Atacante', status: 'Inativo', pagamento: 'Atrasado', apto: false, jogos: 10, gols: 5, assist: 2, cor: '#9b59b6' },
    { id: 13, init: 'RN', nome: 'Rodrigo Nascimento Lima', apelido: 'Digo', num: '15', posicao: 'Volante', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 24, gols: 3, assist: 8, cor: '#e53935' },
    { id: 14, init: 'AT', nome: 'Alexandre Teixeira Leal', apelido: 'Xandão', num: '14', posicao: 'Lateral Direito', status: 'Ativo', pagamento: 'Pendente', apto: false, jogos: 17, gols: 1, assist: 4, cor: '#f39c12' },
    { id: 15, init: 'LC', nome: 'Leandro Castro Vaz', apelido: 'Leão', num: '12', posicao: 'Goleiro', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 14, gols: 0, assist: 0, cor: '#7f8c8d' },
    { id: 16, init: 'BC', nome: 'Bruno Cavalcante Silva', apelido: 'Brunão', num: '16', posicao: 'Meia Atacante', status: 'Suspenso', pagamento: 'Pago', apto: false, jogos: 16, gols: 8, assist: 6, cor: '#16a085' },
    { id: 17, init: 'GS', nome: 'Guilherme Souza Leal', apelido: 'Gui', num: '17', posicao: 'Ponta', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 21, gols: 11, assist: 9, cor: '#27ae60' },
    { id: 18, init: 'FA', nome: 'Fernando Azevedo Lima', apelido: 'Fernandão', num: '18', posicao: 'Zagueiro', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 23, gols: 2, assist: 1, cor: '#c0392b' },
    { id: 19, init: 'PH', nome: 'Pedro Henrique Ramos', apelido: 'Pedrinho', num: '19', posicao: 'Atacante', status: 'Ativo', pagamento: 'Atrasado', apto: false, jogos: 20, gols: 15, assist: 4, cor: '#e67e22' },
    { id: 20, init: 'ER', nome: 'Eduardo Ribeiro Costa', apelido: 'Edu', num: '20', posicao: 'Lateral Esquerdo', status: 'Ativo', pagamento: 'Pago', apto: true, jogos: 22, gols: 3, assist: 10, cor: '#8e44ad' },
  ]);

  // 2. ATUALIZADO PARA LER O SIGNAL: Adicionado os parênteses () em this.jogadores()
  filteredJogadores() {
    return this.jogadores().filter(j =>
      (j.apelido.toLowerCase().includes(this.busca.toLowerCase()) || j.nome.toLowerCase().includes(this.busca.toLowerCase())) &&
      (!this.filtroPosicao || j.posicao === this.filtroPosicao) &&
      (!this.filtroStatus || j.status === this.filtroStatus)
    );
  }

  // 3. ATUALIZADO PARA ENVIAR COM UPDATE
  addJogador() {
    if (!this.novo.apelido) return;
    
    const novoJogador: Jogador = {
      id: this.jogadores().length + 1,
      init: this.novo.apelido.substring(0, 2).toUpperCase(),
      nome: this.novo.nome,
      apelido: this.novo.apelido,
      num: this.novo.num,
      posicao: this.novo.posicao,
      status: this.novo.status,
      pagamento: 'Pendente',
      apto: false,
      jogos: 0,
      gols: 0,
      assist: 0,
      cor: '#0B8F3A'
    };

    // O .update avisa o Angular reativo instantaneamente para atualizar a tela
    this.jogadores.update(lista => [...lista, novoJogador]);
    
    this.novo = { apelido: '', nome: '', num: '', posicao: 'Atacante', status: 'Ativo' };
    this.showModal = false;
  }
}