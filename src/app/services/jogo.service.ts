import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { CriarJogoPayload, Jogo } from '../models/jogo.model';

@Injectable({ providedIn: 'root' })
export class JogoService {
  private readonly apiUrl = `${environment.apiUrl}/jogos`;

  jogos = signal<Jogo[]>([]);
  proximoJogo = signal<Jogo | null>(null);
  erro = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  carregarJogos(): void {
    this.http.get<Jogo[]>(this.apiUrl)
      .pipe(
        tap(lista => this.jogos.set(lista)),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  carregarProximoJogo(): void {
    this.http.get<Jogo | null>(`${this.apiUrl}/proximo`)
      .pipe(
        tap(jogo => this.proximoJogo.set(jogo)),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  criarJogo(payload: CriarJogoPayload): Observable<Jogo> {
    return this.http.post<Jogo>(this.apiUrl, payload).pipe(
      tap(jogo => {
        this.jogos.update(lista => [jogo, ...lista]);
        this.carregarProximoJogo();
      }),
      catchError(err => this.tratarErro(err))
    );
  }

  /**
   * Método de Admin: Agenda o próximo jogo automaticamente com base no dia/horário da configuracao_baba
   */
  agendarProximoJogo(diaTexto: string, horario: string, local: string = 'Campo Principal'): Observable<Jogo> {
    const dataCalculada = this.calcularProximaData(diaTexto, horario);
    
    const payload: CriarJogoPayload = {
      data: dataCalculada.toISOString(),
      local: local || 'Campo Principal',
      timeA: 'Time Verde',
      timeB: 'Time Amarelo',
    };

    return this.criarJogo(payload);
  }

  atualizarJogo(id: number, dados: Partial<Jogo>): Observable<Jogo> {
    return this.http.put<Jogo>(`${this.apiUrl}/${id}`, dados).pipe(
      tap(jogoAtualizado => {
        this.jogos.update(lista => lista.map(j => (j.id === id ? jogoAtualizado : j)));
        this.carregarProximoJogo();
      }),
      catchError(err => this.tratarErro(err))
    );
  }

  removerJogo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.jogos.update(lista => lista.filter(j => j.id !== id))),
      catchError(err => this.tratarErro(err))
    );
  }

  // --- Gestão de Presença ---

  resumoPresencas = signal<{ confirmados: number; recusados: number; pendentes: number } | null>(null);
  minhaPresenca = signal<boolean | null>(null);

  carregarResumoPresencas(jogoId: number): void {
    this.http.get<{ confirmados: number; recusados: number; pendentes: number }>(`${this.apiUrl}/${jogoId}/presencas`)
      .pipe(
        tap(resumo => this.resumoPresencas.set(resumo)),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  carregarMinhaPresenca(jogoId: number): void {
    this.http.get<{ confirmado: boolean | null }>(`${this.apiUrl}/${jogoId}/minha-presenca`)
      .pipe(
        tap(res => this.minhaPresenca.set(res.confirmado)),
        catchError(err => this.tratarErro(err))
      )
      .subscribe();
  }

  /** Auto-atendimento do associado */
  confirmarPresenca(jogoId: number, confirmado: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/${jogoId}/confirmar-presenca`, { confirmado }).pipe(
      tap(() => {
        this.minhaPresenca.set(confirmado);
        this.carregarResumoPresencas(jogoId);
      }),
      catchError(err => this.tratarErro(err))
    );
  }

  /**
   * Poder do Admin: Confirmar ou recusar presença em nome de qualquer jogador
   */
  confirmarPresencaPorAdmin(jogoId: number, jogadorId: number, confirmado: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/${jogoId}/presenca-admin`, { jogadorId, confirmado }).pipe(
      tap(() => this.carregarResumoPresencas(jogoId)),
      catchError(err => this.tratarErro(err))
    );
  }

  private calcularProximaData(diaTexto: string, horario: string): Date {
    const diasDaSemana: { [key: string]: number } = {
      'domingo': 0, 'segunda': 1, 'terça': 2, 'terca': 2, 'quarta': 3,
      'quinta': 4, 'sexta': 5, 'sábado': 6, 'sabado': 6
    };

    const hoje = new Date();
    const diaAlvo = diasDaSemana[(diaTexto || '').toLowerCase().trim()] ?? 6;
    
    let diasAteLa = diaAlvo - hoje.getDay();
    if (diasAteLa <= 0) {
      diasAteLa += 7;
    }

    const [horas, minutos] = (horario || '18:00').split(':').map(Number);
    const dataJogo = new Date();
    dataJogo.setDate(hoje.getDate() + diasAteLa);
    dataJogo.setHours(horas || 18, minutos || 0, 0, 0);

    return dataJogo;
  }

  private tratarErro(err: HttpErrorResponse) {
    const mensagem = err.error?.message
      || (err.status === 0 ? 'Não foi possível conectar à API.' : `Erro ${err.status}`);
    this.erro.set(Array.isArray(mensagem) ? mensagem[0] : mensagem);
    return throwError(() => new Error(mensagem));
  }
}