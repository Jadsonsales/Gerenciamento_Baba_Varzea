import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meu-time',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './meu-time.component.html',
  styleUrls: ['./meu-time.component.css']
})
export class MeuTimeComponent {
  saved = false;
  time = {
    nome: '', historia: '',
    campo: '', endereco: '',
    dia: '', horario: '', duracao: '', formato: ''
  };
  salvar() {
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }
}
