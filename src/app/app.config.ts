import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    // withFetch() usa a Fetch API por baixo dos panos (recomendado pelo
    // Angular 17+, funciona melhor com SSR e streaming).
    // withInterceptors registra o authInterceptor, que anexa o JWT em
    // toda requisição automaticamente — nenhum service precisa fazer
    // isso manualmente.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ]
};
