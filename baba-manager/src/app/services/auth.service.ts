import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'baba_logged_in';

  isLoggedIn(): boolean {
    return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  login(): void {
    sessionStorage.setItem(this.STORAGE_KEY, 'true');
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}