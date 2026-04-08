# Deploying to Cloudflare Pages / Workers

Este projeto foi configurado para ser compatível com a rede global da Cloudflare.

## Problemas Comuns no Build

1. **Módulos Nativos**: Removi o `bcrypt` original e substituí por `bcryptjs`. Módulos nativos (C++) como `bcrypt` e `better-sqlite3` falham no ambiente de build da Cloudflare.
2. **Banco de Dados**: O Cloudflare não suporta arquivos SQLite locais (`database.db`). Você deve usar o **Cloudflare D1**.
   - Já adicionei o binding `D1` no arquivo `wrangler.toml`.
   - Você precisará adaptar o `server.ts` para usar `env.D1` em vez de `better-sqlite3`.

## Configuração Recomendada no Painel da Cloudflare

- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node.js version**: 18 ou superior (defina a variável de ambiente `NODE_VERSION` como `18` ou `20`).

## Variáveis de Ambiente Necessárias

Certifique-se de configurar as seguintes variáveis no painel da Cloudflare:
- `JWT_SECRET`
- `NODE_VERSION` (20)
- `GEMINI_API_KEY`
