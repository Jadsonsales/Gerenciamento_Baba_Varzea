import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isOpenSubject = new BehaviorSubject<boolean>(false); // Começa fechado no mobile
  isOpen$ = this.isOpenSubject.asObservable();

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  close(): void {
    this.isOpenSubject.next(false);
  }
}