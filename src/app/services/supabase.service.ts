import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Inicializa o cliente usando as variáveis do seu environment
  public supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  constructor() { }
}
