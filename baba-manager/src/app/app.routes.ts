import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'jogadores', canActivate: [authGuard], loadComponent: () => import('./pages/jogadores/jogadores.component').then(m => m.JogadoresComponent) },
  { path: 'financeiro', canActivate: [authGuard], loadComponent: () => import('./pages/financeiro/financeiro.component').then(m => m.FinanceiroComponent) },
  { path: 'sorteio', canActivate: [authGuard], loadComponent: () => import('./pages/sorteio/sorteio.component').then(m => m.SorteioComponent) },
  { path: 'meu-time', canActivate: [authGuard], loadComponent: () => import('./pages/meu-time/meu-time.component').then(m => m.MeuTimeComponent) },
  { path: 'notificacoes', canActivate: [authGuard], loadComponent: () => import('./pages/notificacoes/notificacoes.component').then(m => m.NotificacoesComponent) },
  { path: 'configuracoes', canActivate: [authGuard], loadComponent: () => import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent) },
  { path: '**', redirectTo: 'login' }
];