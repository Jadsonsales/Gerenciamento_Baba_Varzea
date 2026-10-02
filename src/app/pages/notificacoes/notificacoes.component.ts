import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { NotificacaoService } from '../../services/notificacao.service';

// Ícone por tipo de notificação, só pra manter o visual que já existia.
const ICONE_POR_TIPO: Record<string, string> = {
  jogador: 'bell',
  pagamento: 'money',
  sorteio: 'sort',
  aviso: 'cal',
};

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css']
})
export class NotificacoesComponent implements OnInit {
  enviado = false;
  enviando = false;
  nova = { tipo: '', dest: '', msg: '' };

  constructor(
    public authService: AuthService,
    public configuracaoService: ConfiguracaoService,
    public notificacaoService: NotificacaoService,
  ) {}

  ngOnInit(): void {
    this.configuracaoService.carregar();
    this.notificacaoService.carregar();
  }

  // Lista real, vinda do backend (evento por evento: cadastro de
  // jogador, sorteio salvo, aviso enviado...), já formatada pro mesmo
  // layout visual que a tela sempre teve.
  get notificacoes() {
    return this.notificacaoService.notificacoes().map(n => ({
      tipo: ICONE_POR_TIPO[n.tipo] ?? 'bell',
      texto: n.texto,
      tempo: this.tempoRelativo(n.criadoEm),
      lida: n.lida,
      id: n.id,
    }));
  }

  get naoLidas() { return this.notificacaoService.naoLidas(); }

  marcarTodas() { this.notificacaoService.marcarTodasComoLidas(); }
  marcarUma(id: number) { this.notificacaoService.marcarComoLida(id); }

  private tempoRelativo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 60) return `há ${Math.max(minutos, 1)}min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas}h`;
    const dias = Math.floor(horas / 24);
    return `há ${dias}d`;
  }

  enviar() {
    if (!this.nova.msg) return;
    this.enviando = true;

    // O envio de verdade que persiste e aparece pra todo mundo é o
    // "aviso" do baba — o mesmo campo editado em Meu Time e mostrado
    // no banner do Dashboard. Isso também gera automaticamente uma
    // notificação (ver ConfiguracoesService.atualizar no backend).
    this.configuracaoService.atualizar({ aviso: this.nova.msg, avisoAtivo: true }).subscribe({
      next: () => {
        this.enviando = false;
        this.enviado = true;
        this.nova = { tipo: '', dest: '', msg: '' };
        this.notificacaoService.carregar();
        setTimeout(() => this.enviado = false, 3000);
      },
      error: () => {
        this.enviando = false;
        alert('Não foi possível enviar o aviso agora.');
      }
    });
  }

  desativarAviso(): void {
    this.configuracaoService.atualizar({ avisoAtivo: false }).subscribe({
      error: () => alert('Não foi possível desativar o aviso.')
    });
  }
}
