import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit, OnDestroy {
  nome = '';
  email = '';
  senha = '';
  aceitouTermos = false;
  mostrarTermos = false;
  carregando = false;
  erro = '';

  // Novas variáveis para os recursos
  mostrarSenha = false;
  temaEscuro = true; // Mantém o tema escuro como padrão

  anoAtual = new Date().getFullYear();

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
    this.temaEscuro = !this.temaEscuro;
  }

  cadastrar() {
    if (!this.nome || !this.email || !this.senha || !this.aceitouTermos) return;

    this.carregando = true;
    this.erro = '';

    this.auth.registrar({ nome: this.nome, email: this.email, senha: this.senha }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.carregando = false;
        this.erro = err.message || 'Não foi possível concluir o cadastro';
      }
    });
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