# Projeto PIX - Gerência de Configuração

Aplicação full-stack simulando operações do PIX, desenvolvida para a disciplina de Gerência de Configuração (UFC - Campus Quixadá).

## Stack

- **Backend:** Java 21, Spring Boot 4, Maven (porta `8080`)
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS (porta `3000`)
- **Infraestrutura e CI/CD:** Docker, Docker Compose, Terraform e GitHub Actions

## Como rodar localmente

### Usando Docker Compose
Na raiz do repositório, execute:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

### Usando Terraform (IaC)
Com as imagens locais já compiladas (`pix-backend:local` e `pix-frontend:local`), entre na pasta `infra/` para provisionar os contêineres:

```bash
cd infra
terraform init
terraform apply
```

Para derrubar os contêineres criados pelo Terraform:

```bash
terraform destroy
```

## Fluxo de Git e CI/CD

O projeto utiliza **Trunk-Based Development** com a branch `main` protegida:

1. **Pull Requests:** Funcionalidades são desenvolvidas em branches curtas (`feat/...`) e integradas na `main` somente após revisão de código e aprovação nos checks automáticos.
2. **CI (Testes e Build):** O GitHub Actions roda os testes do backend (`./mvnw test`), o linter (`npm run lint`) e o build do frontend (`npm run build`).
3. **Ambientes (GitHub Environments):**
   - **Development:** Deploy automático a cada merge na `main`.
   - **Staging (Homologação):** Acionado ao publicar uma tag de release (`v*`), reutilizando a mesma imagem Docker gerada no build.
   - **Production:** Exige aprovação manual do coordenador no GitHub Actions antes de concluir o deploy.
