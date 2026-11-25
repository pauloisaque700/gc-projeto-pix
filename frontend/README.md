# Frontend - Projeto PIX

Interface do ByeBank feita com Next.js e TypeScript.

## Executar

Com o Node.js 20 e o backend em execução, rode na pasta `frontend`.

```bash
npm ci
npm run dev
```

Abra http://localhost:3000. Por padrão, o navegador chama a API em http://localhost:8080. Se o backend estiver em outra porta, defina `NEXT_PUBLIC_API_URL` em `.env.local` e reinicie o Next.js. A origem liberada no backend é `http://localhost:3000`.

Para rodar os três serviços juntos, use o [Docker Compose na raiz](../README.md#usando-docker-compose). O Dockerfile incorpora `NEXT_PUBLIC_API_URL` na compilação. Reconstrua a imagem se mudar esse endereço.

## Acesso à demonstração

Cadastre um usuário pela interface. O cadastro guarda o ID no `localStorage` deste navegador para simular a sessão. O formulário de e-mail e senha ainda não autentica no backend.

## Verificações

```bash
npm run lint
npm run build
```
