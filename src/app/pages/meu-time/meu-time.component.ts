import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { UpdateConfiguracaoPayload } from '../../models/configuracao.model';

@Component({
  selector: 'app-meu-time',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meu-time.component.html',
  styleUrls: ['./meu-time.component.css']
})
export class MeuTimeComponent implements OnInit {
  saved = false;
  salvando = false;
  enviandoLogo = false;

  // Espelha exatamente os campos do ConfiguracaoBaba do backend.
  time = {
    nome: '', historia: '',
    campo: '', endereco: '',
    dia: '', horario: '', duracao: '', formato: '',
    corPrimaria: '#0B8F3A', corSecundaria: '#1a1a1a',
    aviso: '', avisoAtivo: false,
  };

  constructor(public configuracaoService: ConfiguracaoService) {}

  ngOnInit(): void {
    this.configuracaoService.carregar();

    // Assim que a configuração chega da API, preenche o formulário local.
    // Repetimos essa checagem porque o carregar() é assíncrono; um jeito
    // simples de "esperar" sem complicar com efeitos é reagir no próprio
    // template com configuracaoService.configuracao(), mas aqui também
    // sincronizamos pro ngModel funcionar com edição local antes de salvar.
    const preencher = () => {
      const cfg = this.configuracaoService.configuracao();
      if (cfg) {
        this.time = {
          nome: cfg.nome, historia: cfg.historia,
          campo: cfg.campo, endereco: cfg.endereco,
          dia: cfg.dia, horario: cfg.horario, duracao: cfg.duracao, formato: cfg.formato,
          corPrimaria: cfg.corPrimaria, corSecundaria: cfg.corSecundaria,
          aviso: cfg.aviso, avisoAtivo: cfg.avisoAtivo,
        };
      }
    };
    // Pequeno atraso pra dar tempo da resposta HTTP chegar antes de ler o signal.
    setTimeout(preencher, 300);
  }

  get logoUrl(): string | null {
    return this.configuracaoService.logoUrlCompleta();
  }

  salvar(): void {
    this.salvando = true;
    const payload: UpdateConfiguracaoPayload = { ...this.time };

    this.configuracaoService.atualizar(payload).subscribe({
      next: () => {
        this.salvando = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      },
      error: () => {
        this.salvando = false;
        alert('Não foi possível salvar as configurações do baba.');
      }
    });
  }

  onLogoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    if (arquivo.size > 3 * 1024 * 1024) {
      alert('A imagem precisa ter no máximo 3MB.');
      return;
    }

    this.enviandoLogo = true;
    this.configuracaoService.uploadLogo(arquivo).subscribe({
      next: () => { this.enviandoLogo = false; },
      error: () => {
        this.enviandoLogo = false;
        alert('Não foi possível enviar o logo. Verifique o formato do arquivo (jpg, png, webp ou svg).');
      }
    });
  }
}
