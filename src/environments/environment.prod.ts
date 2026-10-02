// Ambiente de PRODUÇÃO.
// Em produção o front e a API devem ser servidos pelo MESMO domínio
// (a API atrás de /api ou de um proxy reverso). Deixe apiUrl vazio para
// usar rotas relativas, ou aponte para a URL pública da API.
export const environment = {
  production: true,
  apiUrl: '',
  supabaseUrl: 'https://ufbmypqdzciudzhbknxx.supabase.co',
  supabaseKey: 'sb_publishable_e5XqmIvcwNB94fb5oBJ8ww_HWoA6nU5'
};
