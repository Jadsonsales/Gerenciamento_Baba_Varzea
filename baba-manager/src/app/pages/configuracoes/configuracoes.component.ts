import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css'],


})
export class ConfiguracoesComponent {
  saved = false;
  conta = { nome:'', email:'', tel:'' };
  baba = { mensalidade:'', vencimento:'', tolerancia:'' };
  features = ['Jogadores ilimitados','Sorteio inteligente equilibrado','Controle financeiro completo','Notificações WhatsApp','Histórico e estatísticas','Suporte prioritário'];
  toggles = [
    {nome:'Aviso de mensalidade próximo do vencimento',sub:'3 dias antes',ativo:true},
    {nome:'Alerta de mensalidade em atraso',sub:'Imediatamente ao vencer',ativo:true},
    {nome:'Confirmação de presença no baba',sub:'2h antes do sorteio',ativo:true},
    {nome:'Resultado do sorteio do baba',sub:'Após cada sorteio',ativo:false},
  ];
  salvar() { this.saved = true; setTimeout(() => this.saved = false, 3000); }
}
