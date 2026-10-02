import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarService } from './services/sidebar.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Injeção moderna de dependências (substitui o construtor poluído)
  public readonly sidebarService = inject(SidebarService);
  public readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  // Fecha o menu ao pressionar ESC
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.sidebarService.close();
  }

  @HostListener('window:resize')
  onResize(): void {
    // Protege contra execução no lado do servidor (SSR)
    if (this.isBrowser && window.innerWidth >= 1024) {
      this.sidebarService.close();
    }
  }

  // Quando o navegador restaura a página do cache (ex: botão "Voltar"
  // depois de um logout), o Angular não roda de novo e o guard não é
  // chamado — sem isso, dava pra ver uma página protegida "congelada"
  // mesmo depois de deslogar. Aqui forçamos a checagem manualmente.
  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: any): void {
    // Só executa se estiver no navegador e se a página veio do cache
    if (this.isBrowser && event.persisted) {
      if (!this.auth.isLoggedIn() && this.router.url !== '/login') {
        this.router.navigate(['/login']);
      }
    }
  }
}
