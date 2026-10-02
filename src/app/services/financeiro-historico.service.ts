import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ArrecadacaoMensal } from '../models/arrecadacao.model';

@Injectable({ providedIn: 'root' })
export class FinanceiroHistoricoService {
  private readonly apiUrl = `${environment.apiUrl}/financeiro`;

  historico = signal<ArrecadacaoMensal[]>([]);
  erro = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  carregarHistorico(): void {
    this.http.get<ArrecadacaoMensal[]>(`${this.apiUrl}/historico`)
      .pipe(
        tap(lista => this.historico.set(lista)),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  // Botão de admin — gera (ou atualiza) o snapshot do mês atual na hora,
  // sem precisar esperar o cron automático rodar no dia 1.
  gerarSnapshotAgora() {
    return this.http.post<ArrecadacaoMensal>(`${this.apiUrl}/snapshot`, {}).pipe(
      tap(() => this.carregarHistorico()),
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
