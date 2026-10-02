import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, finalize } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Jogador, NovoJogador } from '../models/jogador.model';

@Injectable({
  providedIn: 'root'
})
export class JogadorService {
  private readonly apiUrl = `${environment.apiUrl}/jogadores`;

  // Estado compartilhado em signal: qualquer componente que injetar este
  // service enxerga a mesma lista, sempre atualizada.
  jogadores = signal<Jogador[]>([]);
  carregando = signal<boolean>(false);
  erro = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os jogadores na API e atualiza o signal `jogadores`.
   * Chame isso no ngOnInit do componente (ex: jogadores.component.ts).
   */
  carregarJogadores(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.http.get<Jogador[]>(this.apiUrl)
      .pipe(
        tap(lista => this.jogadores.set(lista)),
        catchError(err => this.tratarErro(err)),
        finalize(() => this.carregando.set(false))
      )
      .subscribe();
  }

  /** Busca um único jogador pelo id (ex: tela de edição/detalhes). */
  buscarPorId(id: number): Observable<Jogador> {
    return this.http.get<Jogador>(`${this.apiUrl}/${id}`)
      .pipe(catchError(err => this.tratarErro(err)));
  }

  /**
   * O jogador vinculado à própria conta logada (criado automaticamente
   * no cadastro). Usado na área do associado pra ele marcar/desmarcar
   * "apto" sem precisar de permissão de admin.
   */
  meuJogador = signal<Jogador | null>(null);

  buscarMeuJogador(): Observable<Jogador> {
    return this.http.get<Jogador>(`${this.apiUrl}/me`).pipe(
      tap(jogador => this.meuJogador.set(jogador)),
      catchError(err => this.tratarErro(err))
    );
  }

  /** Auto-atendimento: o associado marca/desmarca a própria aptidão. */
  marcarMinhaAptidao(apto: boolean): Observable<Jogador> {
    return this.http.patch<Jogador>(`${this.apiUrl}/me/apto`, { apto }).pipe(
      tap(jogadorAtualizado => {
        this.meuJogador.set(jogadorAtualizado);
        this.jogadores.update(lista =>
          lista.map(j => (j.id === jogadorAtualizado.id ? jogadorAtualizado : j))
        );
      }),
      catchError(err => this.tratarErro(err))
    );
  }

  /**
   * Cria um novo jogador na API e insere na lista local (signal) assim
   * que a API confirmar, sem precisar recarregar tudo de novo.
   */
  criarJogador(novo: NovoJogador): Observable<Jogador> {
    return this.http.post<Jogador>(this.apiUrl, novo)
      .pipe(
        tap(jogadorCriado => {
          this.jogadores.update(lista => [...lista, jogadorCriado]);
        }),
        catchError(err => this.tratarErro(err))
      );
  }

  /** Atualiza um jogador existente (ex: marcar pagamento, editar posição). */
  atualizarJogador(id: number, dados: Partial<Jogador>): Observable<Jogador> {
    // Trocado de http.put para http.patch para aceitar atualizações parciais
    return this.http.patch<Jogador>(`${this.apiUrl}/${id}`, dados)
      .pipe(
        tap(jogadorAtualizado => {
          this.jogadores.update(lista =>
            lista.map(j => (j.id === id ? jogadorAtualizado : j))
          );
        }),
        catchError(err => this.tratarErro(err))
      );
  }

  /** Remove um jogador da API e da lista local. */
  removerJogador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.jogadores.update(lista => lista.filter(j => j.id !== id));
        }),
        catchError(err => this.tratarErro(err))
      );
  }

  private tratarErro(err: HttpErrorResponse) {
    const mensagem = err.error?.message
      || (err.status === 0
        ? 'Não foi possível conectar à API. Ela está rodando?'
        : `Erro ${err.status}: ${err.statusText}`);

    this.erro.set(mensagem);
    console.error('[JogadorService]', err);
    return throwError(() => new Error(mensagem));
  }
}
