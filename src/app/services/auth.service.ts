import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload, Usuario } from '../models/auth.model';

const TOKEN_KEY = 'baba_token';
const USUARIO_KEY = 'baba_usuario';

/**
 * Autenticação real contra a API NestJS (POST /auth/login e /auth/register).
 * O token JWT devolvido é guardado e enviado pelo auth.interceptor.ts em
 * toda requisição — antes disso, boa parte das rotas respondia 401.
 *
 * O Supabase continua sendo o BANCO (Postgres) usado pelo backend via
 * Prisma; a autenticação é feita pela própria API, que também é quem
 * controla as roles (ADMIN/USER).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  usuarioAtual = signal<Usuario | null>(this.lerUsuarioSalvo());
  erro = signal<string | null>(null);

  logado = computed(() => this.usuarioAtual() !== null);

  constructor(private http: HttpClient) {}

  private get storage(): Storage | null {
    return typeof window !== 'undefined' ? window.localStorage : null;
  }

  private lerUsuarioSalvo(): Usuario | null {
    const bruto = this.storage?.getItem(USUARIO_KEY);
    if (!bruto) return null;
    try {
      return JSON.parse(bruto) as Usuario;
    } catch {
      return null;
    }
  }

  private guardarSessao(resposta: AuthResponse): void {
    this.storage?.setItem(TOKEN_KEY, resposta.access_token);
    this.storage?.setItem(USUARIO_KEY, JSON.stringify(resposta.usuario));
    this.usuarioAtual.set(resposta.usuario);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    this.erro.set(null);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(resposta => this.guardarSessao(resposta)),
      catchError(err => this.tratarErro(err, 'E-mail ou senha inválidos')),
    );
  }

  registrar(payload: RegisterPayload): Observable<AuthResponse> {
    this.erro.set(null);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(resposta => this.guardarSessao(resposta)),
      catchError(err => this.tratarErro(err, 'Não foi possível concluir o cadastro')),
    );
  }

  logout(): void {
    this.storage?.removeItem(TOKEN_KEY);
    this.storage?.removeItem(USUARIO_KEY);
    this.usuarioAtual.set(null);
  }

  getToken(): string | null {
    return this.storage?.getItem(TOKEN_KEY) ?? null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getRole(): 'ADMIN' | 'USER' {
    return this.usuarioAtual()?.role ?? 'USER';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  private tratarErro(err: HttpErrorResponse, fallback: string) {
    const mensagemApi = err.error?.message;
    const mensagem = Array.isArray(mensagemApi) ? mensagemApi[0] : mensagemApi;
    const final = mensagem
      || (err.status === 0 ? 'Não foi possível conectar à API.' : fallback);

    this.erro.set(final);
    return throwError(() => new Error(final));
  }
}
