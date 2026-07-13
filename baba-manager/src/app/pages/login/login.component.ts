import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
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
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  senha = '';
  aceitouTermos = false;
  mostrarTermos = false;

  // Ano atual para o Copyright dinâmico
  anoAtual = new Date().getFullYear();

  // Dados para o Slide de Divulgação
  slides = [
    { titulo: 'GERENCIE SEU BABA', destaque: 'DAQUELE JEITÃO', desc: 'A plataforma completa para organizar babas, controlar mensalidades e sortear times de forma inteligente.' },
    { titulo: 'SORTEIO SEM MI MI MI', destaque: 'SEM PANELINHA', desc: 'Sorteie os babas equilibrando o nível técnico dos cansados.' },
    { titulo: 'MENSALIDADE EM DIA', destaque: 'DURO DORME E FICA EM CASA', desc: 'Saiba quem está apto e está pendente do Baba de forma automatizada.' }
  ];
  slideAtivo = 0;
  intervaloSlider: any;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.iniciarSlideAutomatico();
  }

  ngOnDestroy() {
    this.pararSlideAutomatico();
  }

  iniciarSlideAutomatico() {
    this.intervaloSlider = setInterval(() => {
      this.proximoSlide();
    }, 5000); // Muda a cada 5 segundos
  }

  pararSlideAutomatico() {
    if (this.intervaloSlider) {
      clearInterval(this.intervaloSlider);
    }
  }

  mudarSlide(index: number) {
    this.slideAtivo = index;
    // Reinicia o contador para não pular rápido logo após o clique
    this.pararSlideAutomatico();
    this.iniciarSlideAutomatico();
  }

  proximoSlide() {
    this.slideAtivo = (this.slideAtivo + 1) % this.slides.length;
  }

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
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.fecharTermos();
  }
}