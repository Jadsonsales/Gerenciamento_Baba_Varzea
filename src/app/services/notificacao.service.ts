import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacao } from '../models/notificacao.model';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly apiUrl = `${environment.apiUrl}/notificacoes`;

  notificacoes = signal<Notificacao[]>([]);
  erro = signal<string | null>(null);

  naoLidas = computed(() => this.notificacoes().filter(n => !n.lida).length);

  constructor(private http: HttpClient) {}

  carregar(): void {
    this.http.get<Notificacao[]>(this.apiUrl)
      .pipe(
        tap(lista => this.notificacoes.set(lista)),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  marcarComoLida(id: number): void {
    this.http.post(`${this.apiUrl}/${id}/marcar-lida`, {})
      .pipe(
        tap(() => this.notificacoes.update(lista =>
          lista.map(n => (n.id === id ? { ...n, lida: true } : n))
        )),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  marcarTodasComoLidas(): void {
    this.http.post(`${this.apiUrl}/marcar-todas-lidas`, {})
      .pipe(
        tap(() => this.notificacoes.update(lista => lista.map(n => ({ ...n, lida: true })))),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  private tratarErro(err: HttpErrorResponse) {
    const mensagem = err.error?.message
      || (err.status === 0 ? 'Não foi possível conectar à API.' : `Erro ${err.status}`);
    this.erro.set(Array.isArray(mensagem) ? mensagem[0] : mensagem);
    return throwError(() => new Error(mensagem));
  }
}
