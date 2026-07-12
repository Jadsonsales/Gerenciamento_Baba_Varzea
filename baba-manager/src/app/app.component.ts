import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  constructor(
    public sidebarService: SidebarService,
    public router: Router,
    private auth: AuthService
  ) {}

  // Fecha o menu ao pressionar ESC
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.sidebarService.close();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.sidebarService.close();
    }
  }

  // Quando o navegador restaura a página do cache (ex: botão "Voltar"
  // depois de um logout), o Angular não roda de novo e o guard não é
  // chamado — sem isso, dava pra ver uma página protegida "congelada"
  // mesmo depois de deslogar. Aqui forçamos a checagem manualmente.
  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: PageTransitionEvent): void {
    if (event.persisted && !this.auth.isLoggedIn() && this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }
}