import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css']
})


export class NotificacoesComponent {
  enviado = false;
  nova = { tipo:'', dest:'', msg:'' };
  notificacoes = [
    {tipo:'money',texto:'Marcos Vinícius está com mensalidade atrasada há 15 dias',tempo:'há 2h',lida:false},
    {tipo:'cal',texto:'Confirmação de presença: Pelada de Sábado — 14:00h no Campo do Zé',tempo:'há 5h',lida:false},
    {tipo:'sort',texto:'Sorteio de times realizado para o jogo de amanhã — 12 jogadores',tempo:'há 1d',lida:true},
    {tipo:'money',texto:'Anderson Pereira está com mensalidade atrasada há 30 dias',tempo:'há 1d',lida:true},
    {tipo:'cal',texto:'Partida cancelada — Campo do Zé em manutenção este sábado',tempo:'há 2d',lida:true},
    {tipo:'bell',texto:'Novo jogador cadastrado: Pedro Henrique Ramos (Pedrinho)',tempo:'há 3d',lida:true},
  ];
  get naoLidas() { return this.notificacoes.filter(n => !n.lida).length; }
  marcarTodas() { this.notificacoes.forEach(n => n.lida = true); }
  enviar() {
    if (!this.nova.msg) return;
    this.enviado = true;
    this.nova = { tipo:'', dest:'', msg:'' };
    setTimeout(() => this.enviado = false, 3000);
  }
}
