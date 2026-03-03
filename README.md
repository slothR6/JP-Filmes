# JP Filmes

Catalogo de filmes em Next.js 16 com hidratacao automatica via TMDb, persistencia local em JSON para desenvolvimento e player HTML5 para teste.

## Configuracao

1. Crie uma conta no TMDb.
2. No painel do TMDb, gere um `Read Access Token` (v4 auth token).
3. Copie `.env.example` para `.env.local`.
4. Preencha:

```bash
TMDB_READ_ACCESS_TOKEN=seu_token_bearer_aqui
```

## Rodando localmente

```bash
npm install
npm run dev
```

Comandos uteis:

```bash
npm run lint
npm run build
npm run start
```

## Fluxo de adicionar filme

- Abra `/admin/adicionar`.
- Pesquise por titulo e, se quiser, informe o ano.
- Clique em `Adicionar`.
- O projeto grava apenas o registro minimo em `src/data/movies.json`.
- A listagem em `/filmes` e a pagina `/filmes/[id]` passam a hidratar o resto pelo TMDb no server.

## Ajustes internos

Na tela `/admin/adicionar` voce pode salvar:

- `featured`
- `tags`
- `audioPreference`
- `playback.type`
- `playback.src`

Esses campos continuam locais; todo o resto vem do TMDb.

## Player de teste

O dataset inicial ja traz um filme com:

```txt
playback.type = "url"
playback.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
```

Abra o detalhe do filme em `/filmes/603` para validar o player. Tambem e possivel trocar a URL do player no admin.

## Persistencia local

- A escrita em `src/data/movies.json` funciona bem localmente.
- Para deploy com persistencia real, troque esse storage por banco ou servico externo.

## Estrutura principal

- `/` landing com destaques e acessos rapidos.
- `/filmes` catalogo com filtros em cima dos dados hidratados.
- `/filmes/[id]` detalhe do filme e player.
- `/admin/adicionar` busca TMDb, adiciona filmes e salva preferencias internas.
- `/app/api/tmdb/*` rotas server-side para detalhes, creditos e busca.
