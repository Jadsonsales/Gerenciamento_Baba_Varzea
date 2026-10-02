import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // 💡 Opcional: passa a URL original via Query Params para o componente de Login usar depois
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
