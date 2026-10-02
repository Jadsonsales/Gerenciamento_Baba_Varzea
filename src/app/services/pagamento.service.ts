import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AtualizarPagamentoPayload,
  CriarPagamentoPayload,
  Pagamento,
} from '../models/pagamento.model';

/**
 * Mensalidades (tabela `pagamentos`). Cada registro é um lançamento de um
 * jogador num mês de referência ("YYYY-MM"), ligado por jogadorId — é a
 * fonte da verdade do Financeiro e do snapshot de arrecadação.
 */
@Injectable({ providedIn: 'root' })
export class PagamentoService {
  private readonly apiUrl = `${environment.apiUrl}/pagamentos`;

  pagamentos = signal<Pagamento[]>([]);
  carregando = signal<boolean>(false);
  erro = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Mês atual no formato aceito pela API (ex: "2026-09"). */
  static referenciaAtual(data = new Date()): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
  }

  carregarMes(referencia?: string): void {
    const ref = referencia ?? PagamentoService.referenciaAtual();
    this.carregando.set(true);
    this.erro.set(null);

    this.http.get<Pagamento[]>(`${this.apiUrl}?mes=${ref}`)
      .pipe(
        tap(lista => this.pagamentos.set(lista)),
        catchError(err => this.tratarErro(err)),
        finalize(() => this.carregando.set(false)),
      )
      .subscribe();
  }

  carregarPorJogador(jogadorId: number): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}/jogador/${jogadorId}`)
      .pipe(catchError(err => this.tratarErro(err)));
  }

  // Cria (ou atualiza) o lançamento daquele jogador/mês. O backend usa
  // upsert por (jogadorId, referencia), então nunca duplica.
  criar(payload: CriarPagamentoPayload): Observable<Pagamento> {
    return this.http.post<Pagamento>(this.apiUrl, payload).pipe(
      tap(pagamento => this.upsertLocal(pagamento)),
      catchError(err => this.tratarErro(err)),
    );
  }

  atualizar(id: number, payload: AtualizarPagamentoPayload): Observable<Pagamento> {
    return this.http.put<Pagamento>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(pagamento => this.upsertLocal(pagamento)),
      catchError(err => this.tratarErro(err)),
    );
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.pagamentos.update(lista => lista.filter(p => p.id !== id))),
      catchError(err => this.tratarErro(err)),
    );
  }

  /** Cria os lançamentos Pendente do mês para todo jogador Ativo (idempotente). */
  gerarMes(ano?: number, mes?: number): Observable<{ referencia: string; gerados: number }> {
    const referencia = ano && mes
      ? `${ano}-${String(mes).padStart(2, '0')}`
      : PagamentoService.referenciaAtual();

    return this.http.post<{ referencia: string; gerados: number }>(`${this.apiUrl}/gerar-mes`, { ano, mes }).pipe(
      catchError(err => this.tratarErro(err)),
    );
  }

  private upsertLocal(pagamento: Pagamento): void {
    this.pagamentos.update(lista => {
      const indice = lista.findIndex(p => p.id === pagamento.id);
      if (indice === -1) return [...lista, pagamento];
      return lista.map(p => (p.id === pagamento.id ? pagamento : p));
    });
  }

  private tratarErro(err: HttpErrorResponse) {
    const mensagemApi = err.error?.message;
    const mensagem = Array.isArray(mensagemApi) ? mensagemApi[0] : mensagemApi;
    const final = mensagem
      || (err.status === 0 ? 'Não foi possível conectar à API.' : `Erro ${err.status}`);

    this.erro.set(final);
    return throwError(() => new Error(final));
  }
}
