import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MinhaConta, UpdateMinhaContaPayload } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  minhaConta = signal<MinhaConta | null>(null);
  erro = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  carregarMinhaConta() {
    return this.http.get<MinhaConta>(`${this.apiUrl}/me`).pipe(
      tap(conta => this.minhaConta.set(conta)),
      catchError(err => this.tratarErro(err))
    );
  }

  atualizarMinhaConta(dados: UpdateMinhaContaPayload) {
    return this.http.put<MinhaConta>(`${this.apiUrl}/me`, dados).pipe(
      tap(conta => this.minhaConta.set(conta)),
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
