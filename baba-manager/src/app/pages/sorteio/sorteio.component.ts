import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sorteio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sorteio.component.html',
  styleUrls: ['./sorteio.component.css'],
})
export class SorteioComponent {
  passo = 1;
  modo = '';
  selecionados: number[] = [];
  resultado: any = null;

  aptos = [
    {id:1,init:'CE',apelido:'Carlão',posicao:'Meio-Camp.',cor:'#2ecc71'},
    {id:2,init:'RA',apelido:'Beto',posicao:'Atacante',cor:'#e53935'},
    {id:4,init:'FR',apelido:'Felipão',posicao:'Goleiro',cor:'#9b59b6'},
    {id:6,init:'RS',apelido:'Rafa',posicao:'Meia Atac.',cor:'#e74c3c'},
    {id:7,init:'TB',apelido:'Thiagão',posicao:'Volante',cor:'#3498db'},
    {id:9,init:'LO',apelido:'Lucão',posicao:'Zagueiro',cor:'#2980b9'},
    {id:10,init:'GM',apelido:'Gabizinho',posicao:'Meio-Camp.',cor:'#8e44ad'},
    {id:11,init:'PH',apelido:'PH',posicao:'Lat. Direito',cor:'#e67e22'},
    {id:13,init:'RN',apelido:'Digo',posicao:'Volante',cor:'#e53935'},
    {id:15,init:'LC',apelido:'Leão',posicao:'Goleiro',cor:'#7f8c8d'},
    {id:17,init:'GS',apelido:'Gui',posicao:'Ponta',cor:'#27ae60'},
    {id:18,init:'FA',apelido:'Fernandão',posicao:'Zagueiro',cor:'#c0392b'},
    {id:20,init:'ER',apelido:'Edu',posicao:'Lat. Esq.',cor:'#8e44ad'},
  ];

  selecionarModo(m: string) { this.modo = m; this.passo = 2; }
  toggleJog(id: number) {
    const i = this.selecionados.indexOf(id);
    if (i > -1) this.selecionados.splice(i, 1);
    else this.selecionados.push(id);
  }
  sortear() {
    const jogsSel = this.aptos.filter(j => this.selecionados.includes(j.id));
    const shuffled = [...jogsSel].sort(() => Math.random() - 0.5);
    const meio = Math.ceil(shuffled.length / 2);
    this.resultado = [
      { nome: 'Baba 1', jogadores: shuffled.slice(0, meio) },
      { nome: 'Baba 2', jogadores: shuffled.slice(meio) }
    ];
    this.passo = 3;
  }
  novaSorteio() { this.resultado = null; this.selecionados = []; this.passo = 1; }
}