// Ambiente de DESENVOLVIMENTO.
// apiUrl vazio => as chamadas saem do MESMO domínio/porta do front
// (ex: /auth/login) e são repassadas ao backend pelo proxy do dev server
// (proxy.conf.json -> http://localhost:3333). Isso evita CORS e faz o
// preview online (que expõe só uma porta) funcionar sem configuração extra.
export const environment = {
  production: true,
  apiUrl: 'https://onrender.com'
};
