import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'cadastro', loadComponent: () => import('./pages/cadastro/cadastro.component').then(m => m.CadastroComponent) },

  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'sorteio', canActivate: [authGuard], loadComponent: () => import('./pages/sorteio/sorteio.component').then(m => m.SorteioComponent) },
  { path: 'notificacoes', canActivate: [authGuard], loadComponent: () => import('./pages/notificacoes/notificacoes.component').then(m => m.NotificacoesComponent) },

  { path: 'jogadores', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/jogadores/jogadores.component').then(m => m.JogadoresComponent) },
  { path: 'financeiro', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/financeiro/financeiro.component').then(m => m.FinanceiroComponent) },
  { path: 'meu-time', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/meu-time/meu-time.component').then(m => m.MeuTimeComponent) },
  { path: 'configuracoes', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent) },

  { path: '**', redirectTo: 'login' }
];