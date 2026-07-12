import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.css']
})


export class FinanceiroComponent {
  historico = [{l:'Jan',v:18},{l:'Fev',v:16},{l:'Mar',v:17},{l:'Abr',v:15},{l:'Mai',v:19},{l:'Jun',v:14}];
  pagamentos = [
    {init:'CE',apelido:'Carlão',nome:'Carlos Eduardo',posicao:'Meio-Campista',status:'Pago',cor:'#2ecc71'},
    {init:'RA',apelido:'Beto',nome:'Roberto Alves',posicao:'Atacante',status:'Pago',cor:'#e53935'},
    {init:'MV',apelido:'Marquinho',nome:'Marcos Vinicius',posicao:'Ponta',status:'Atrasado',cor:'#e67e22'},
    {init:'FR',apelido:'Felipão',nome:'Felipe Rodrigues',posicao:'Goleiro',status:'Pago',cor:'#9b59b6'},
    {init:'DF',apelido:'Diegão',nome:'Diego Ferreira',posicao:'Zagueiro',status:'Pendente',cor:'#1abc9c'},
    {init:'RS',apelido:'Rafa',nome:'Rafael Sousa',posicao:'Meia Atacante',status:'Pago',cor:'#e74c3c'},
    {init:'TB',apelido:'Thiagão',nome:'Thiago Barbosa',posicao:'Volante',status:'Pago',cor:'#3498db'},
    {init:'AP',apelido:'Andinho',nome:'Anderson Pereira',posicao:'Lateral Esquerdo',status:'Atrasado',cor:'#27ae60'},
    {init:'LO',apelido:'Lucão',nome:'Lucas Oliveira',posicao:'Zagueiro',status:'Pago',cor:'#2980b9'},
    {init:'GM',apelido:'Gabizinho',nome:'Gabriel Martins',posicao:'Meio-Campista',status:'Pago',cor:'#8e44ad'},
    {init:'PH',apelido:'PH',nome:'Paulo Henrique',posicao:'Lateral Direito',status:'Pago',cor:'#e67e22'},
    {init:'MF',apelido:'Matezão',nome:'Mateus Ferreira',posicao:'Atacante',status:'Atrasado',cor:'#9b59b6'},
    {init:'RN',apelido:'Digo',nome:'Rodrigo Nascimento',posicao:'Volante',status:'Pago',cor:'#e53935'},
    {init:'AT',apelido:'Xandão',nome:'Alexandre Teixeira',posicao:'Lateral Direito',status:'Pendente',cor:'#f39c12'},
    {init:'LC',apelido:'Leão',nome:'Leandro Castro',posicao:'Goleiro',status:'Pago',cor:'#7f8c8d'},
    {init:'BC',apelido:'Brunão',nome:'Bruno Cavalcante',posicao:'Meia Atacante',status:'Pago',cor:'#16a085'},
    {init:'GS',apelido:'Gui',nome:'Guilherme Souza',posicao:'Ponta',status:'Pago',cor:'#27ae60'},
    {init:'FA',apelido:'Fernandão',nome:'Fernando Azevedo',posicao:'Zagueiro',status:'Pago',cor:'#c0392b'},
    {init:'PH',apelido:'Pedrinho',nome:'Pedro Henrique',posicao:'Atacante',status:'Atrasado',cor:'#e67e22'},
    {init:'ER',apelido:'Edu',nome:'Eduardo Ribeiro',posicao:'Lateral Esquerdo',status:'Pago',cor:'#8e44ad'},
  ];
  marcarPago(p: any) { p.status = 'Pago'; }
}
