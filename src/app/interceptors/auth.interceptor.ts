import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional (padrão Angular 15+/19): roda em toda requisição
 * HTTP feita pela aplicação. Aqui ele:
 * 1. Anexa "Authorization: Bearer <token>" quando existe um token salvo.
 * 2. Se a API responder 401 (token inválido/expirado), desloga e manda
 *    de volta pro login — evita a tela ficar "travada" com dado velho.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  const reqComToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqComToken).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
