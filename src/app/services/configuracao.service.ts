import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConfiguracaoBaba, UpdateConfiguracaoPayload } from '../models/configuracao.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracaoService {
  private readonly apiUrl = `${environment.apiUrl}/configuracoes`;

  configuracao = signal<ConfiguracaoBaba | null>(null);
  erro = signal<string | null>(null);

  // logoUrl vem relativo (ex: "/uploads/logo-123.png"); aqui já monta a
  // URL completa pra usar direto num <img src="...">.
  logoUrlCompleta = computed(() => {
    const cfg = this.configuracao();
    return cfg?.logoUrl ? `${environment.apiUrl}${cfg.logoUrl}` : null;
  });

  constructor(private http: HttpClient) {}

  carregar() {
    this.http.get<ConfiguracaoBaba>(this.apiUrl)
      .pipe(
        tap(cfg => this.configuracao.set(cfg)),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  atualizar(dados: UpdateConfiguracaoPayload) {
    return this.http.put<ConfiguracaoBaba>(this.apiUrl, dados).pipe(
      tap(cfg => this.configuracao.set(cfg)),
      catchError(err => this.tratarErro(err))
    );
  }

  uploadLogo(arquivo: File) {
    const formData = new FormData();
    formData.append('logo', arquivo);

    return this.http.post<ConfiguracaoBaba>(`${this.apiUrl}/logo`, formData).pipe(
      tap(cfg => this.configuracao.set(cfg)),
      catchError(err => this.tratarErro(err))
    );
  }

  private tratarErro(err: HttpErrorResponse) {
    const mensagem = err.error?.message
      || (err.status === 0 ? 'Não foi possível conectar à API.' : `Erro ${err.status}`);
    this.erro.set(Array.isArray(mensagem) ? mensagem[0] : mensagem);
    return throwError(() => new Error(mensagem));
  }
}
