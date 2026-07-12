import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = 'admin@babamanager.com';
  senha = 'senha123';
  aceitouTermos = false;
  mostrarTermos = false;

  constructor(private router: Router, private auth: AuthService) {}

  entrar() {
    if (!this.aceitouTermos) return;
    this.auth.login();
    this.router.navigate(['/dashboard']);
  }

  abrirTermos(event: Event) {
    event.preventDefault();
    this.mostrarTermos = true;
  }

  fecharTermos() {
    this.mostrarTermos = false;
    console.log('Novo valor:', this.mostrarTermos);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.fecharTermos();
  }
}