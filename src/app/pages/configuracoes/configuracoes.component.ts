import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css'],
})
export class ConfiguracoesComponent implements OnInit {
  saved = false;
  salvandoConta = false;
  salvandoBaba = false;

  conta = { nome: '', email: '', tel: '' };
  baba = { valorMensalidade: 50, diaVencimento: 10, diasTolerancia: 3 };

  toggles = [
    { chave: 'prefAvisoMensalidade' as const, nome: 'Aviso de mensalidade próximo do vencimento', sub: '3 dias antes', ativo: true },
    { chave: 'prefAlertaAtraso' as const, nome: 'Alerta de mensalidade em atraso', sub: 'Imediatamente ao vencer', ativo: true },
    { chave: 'prefConfirmacaoPresenca' as const, nome: 'Confirmação de presença no baba', sub: '2h antes do sorteio', ativo: true },
    { chave: 'prefResultadoSorteio' as const, nome: 'Resultado do sorteio do baba', sub: 'Após cada sorteio', ativo: false },
  ];

  // "Plano" continua fixo por enquanto — não existe cobrança/assinatura
  // implementada ainda (ver conversa sobre transformar isso num SaaS).
  features = ['Jogadores ilimitados', 'Sorteio inteligente equilibrado', 'Controle financeiro completo', 'Notificações WhatsApp', 'Histórico e estatísticas', 'Suporte prioritário'];

  constructor(
    private usuarioService: UsuarioService,
    private configuracaoService: ConfiguracaoService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.configuracaoService.carregar();

    this.usuarioService.carregarMinhaConta().subscribe({
      next: (c) => {
        this.conta = { nome: c.nome, email: c.email, tel: c.tel };
        this.toggles.forEach(t => t.ativo = c[t.chave]);
      },
      error: () => {}
    });

    // Preenche o bloco "Configurações do Baba" assim que a config chegar.
    setTimeout(() => {
      const cfg = this.configuracaoService.configuracao();
      if (cfg) {
        this.baba = {
          valorMensalidade: cfg.valorMensalidade,
          diaVencimento: cfg.diaVencimento,
          diasTolerancia: cfg.diasTolerancia,
        };
      }
    }, 300);
  }

  salvarConta(): void {
    this.salvandoConta = true;
    const payload = {
      nome: this.conta.nome,
      tel: this.conta.tel,
      ...Object.fromEntries(this.toggles.map(t => [t.chave, t.ativo])),
    };

    this.usuarioService.atualizarMinhaConta(payload).subscribe({
      next: () => { this.salvandoConta = false; this.mostrarSaved(); },
      error: () => { this.salvandoConta = false; alert('Não foi possível salvar a conta.'); }
    });
  }

  salvarBaba(): void {
    // Só admin pode editar (a rota PUT /configuracoes já bloqueia no
    // backend); esse botão só aparece de qualquer forma pra quem é admin.
    this.salvandoBaba = true;
    this.configuracaoService.atualizar(this.baba).subscribe({
      next: () => { this.salvandoBaba = false; this.mostrarSaved(); },
      error: () => { this.salvandoBaba = false; alert('Não foi possível salvar as configurações do baba.'); }
    });
  }

  private mostrarSaved(): void {
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }
}
