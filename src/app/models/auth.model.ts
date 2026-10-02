export type UserRole = 'ADMIN' | 'USER';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
}
