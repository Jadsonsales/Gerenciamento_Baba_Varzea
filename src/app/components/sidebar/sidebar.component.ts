import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../services/auth.service';
import { NotificacaoService } from '../../services/notificacao.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  constructor(
    public sidebarService: SidebarService,
    public auth: AuthService,
    public notificacaoService: NotificacaoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.notificacaoService.carregar();
    }
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  get nomeUsuario(): string {
    return this.auth.usuarioAtual()?.nome || 'Usuário';
  }

  get iniciais(): string {
    return this.nomeUsuario
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('');
  }

  get naoLidas(): number {
    return this.notificacaoService.naoLidas();
  }

  logout(): void {
    this.auth.logout();
    this.sidebarService.close();
    this.router.navigate(['/login']);
  }
}
