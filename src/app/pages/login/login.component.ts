import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  senha = '';
  lembrarMim = false;
  carregando = false;
  erro = '';

  mostrarSenha = false;
  anoAtual = new Date().getFullYear();

  slides = [
    { titulo: 'GERENCIE SEU BABA', destaque: 'DAQUELE JEITÃO', desc: 'A plataforma completa para organizar babas, controlar mensalidades e sortear times de forma inteligente.' },
    { titulo: 'SORTEIO SEM MI MI MI', destaque: 'SEM PANELINHA', desc: 'Sorteie os babas equilibrando o nível técnico dos cansados.' },
    { titulo: 'MENSALIDADE EM DIA', destaque: 'DURO DORME E FICA EM CASA', desc: 'Saiba quem está apto e está pendente do Baba de forma automatizada.' }
  ];
  slideAtivo = 0;
  intervaloSlider: any;

  constructor(
    private router: Router, 
    private auth: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.iniciarSlideAutomatico();
  }

  ngOnDestroy() {
    this.pararSlideAutomatico();
  }

  iniciarSlideAutomatico() {
    this.intervaloSlider = setInterval(() => this.proximoSlide(), 5000);
  }

  pararSlideAutomatico() {
    if (this.intervaloSlider) clearInterval(this.intervaloSlider);
  }

  mudarSlide(index: number) {
    this.slideAtivo = index;
    this.pararSlideAutomatico();
    this.iniciarSlideAutomatico();
  }

  proximoSlide() {
    this.slideAtivo = (this.slideAtivo + 1) % this.slides.length;
  }

  toggleMostrarSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleTema() {
    this.themeService.toggleTheme();
  }

  logar() {
    if (!this.email || !this.senha) return;

    this.carregando = true;
    this.erro = '';

    this.auth.login({ email: this.email, senha: this.senha }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.carregando = false;
        this.erro = err.message || 'E-mail ou senha inválidos';
      }
    });
  }
}