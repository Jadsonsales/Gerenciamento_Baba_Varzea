import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isLight = false;

  constructor() {
    // Recupera a preferência salva ao carregar a aplicação
    const temaSalvo = localStorage.getItem('baba_tema');
    if (temaSalvo === 'light') {
      this.setLightMode(true);
    }
  }

  isLightMode(): boolean {
    return this.isLight;
  }

  toggleTheme(): void {
    this.setLightMode(!this.isLight);
  }

  private setLightMode(isLight: boolean): void {
    this.isLight = isLight;
    if (isLight) {
      document.body.classList.add('light-theme');
      localStorage.setItem('baba_tema', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('baba_tema', 'dark');
    }
  }
}