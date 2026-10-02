# HttpClient + JogadorService — como testar agora

O que foi feito no projeto:

- `src/environments/environment.ts` e `environment.prod.ts` — URL da API por ambiente.
- `src/app/models/jogador.model.ts` — interface `Jogador` (antes vivia dentro do componente).
- `src/app/services/jogador.service.ts` — CRUD completo com `HttpClient` (GET, POST, PUT, DELETE), estado em `signal` e tratamento de erro.
- `src/app/app.config.ts` — `provideHttpClient(withFetch())` adicionado.
- `src/app/pages/jogadores/jogadores.component.ts` — não tem mais array hardcoded; busca e cadastra jogadores de verdade via `JogadorService`.
- `mock-api/db.json` — um banco fake com os mesmos 20 jogadores de antes, pra você testar sem esperar o backend Node ficar pronto.

## Como rodar em 2 minutos (sem backend próprio ainda)

Em um terminal, suba a API fake:

```bash
npm install -D json-server
npm run mock-api
```

Isso sobe uma API REST completa em `http://localhost:3000/jogadores` (GET, POST, PUT, DELETE já funcionam sozinhos, o json-server cuida disso).

Em outro terminal, suba o Angular normalmente:

```bash
npm start
```

Abra a tela de Jogadores: a lista agora vem de uma requisição HTTP real (`GET /jogadores`), e o formulário "Adicionar jogador" faz um `POST` de verdade — dá F5 na página e o jogador cadastrado continua lá, porque está salvo no `mock-api/db.json`.

## Quando o backend Node/NestJS estiver pronto

Só troque uma linha em `src/environments/environment.ts`:

```ts
apiUrl: 'http://localhost:3333/api' // ou a porta que seu backend Node usar
```

Nenhum outro arquivo do front precisa mudar — é exatamente por isso que a URL fica isolada no `environment.ts` e não espalhada pelos componentes.

## Próximos passos sugeridos (mesma receita pros outros módulos)

Repita esse mesmo padrão para as outras telas que ainda têm dado mockado:

1. `financeiro.component.ts` → criar `FinanceiroService` + endpoint `/pagamentos`.
2. `dashboard.component.ts` → provavelmente vai consumir vários services juntos (jogadores + financeiro).
3. `sorteio.component.ts` → pode reaproveitar o `JogadorService.jogadores` que já existe, sem precisar de endpoint novo.
4. `auth.service.ts` → trocar `sessionStorage` fake por um `POST /auth/login` real que devolve um JWT (isso é o próximo curso da sua trilha: Node.js com autenticação + JWT).
