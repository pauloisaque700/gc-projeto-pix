# Projeto PIX - Gerência de Configuração

Aplicação full-stack simulando operações do PIX, desenvolvida para a disciplina de Gerência de Configuração (UFC - Campus Quixadá).

## Stack

- **Backend:** Java 21, Spring Boot 4, Maven (porta `8080`)
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS (porta `3000`)
- **Banco:** MySQL 8.4
- **Infraestrutura e CI/CD:** Docker, Docker Compose, Terraform e GitHub Actions

## Como rodar localmente

### Usando Docker Compose

Com o Docker em execução e o plugin Compose instalado, rode na raiz do projeto.

```bash
docker compose up --build
```

- **Frontend** em http://localhost:3000.
- **Backend** em http://localhost:8080, com as rotas sob `/api`.
- **MySQL** em `127.0.0.1:3306` para ferramentas locais. O backend usa `mysql:3306` na rede do Compose.

O backend usa o perfil `mysql` por padrão. O banco `byebank_db` é criado pelo `init.sql` na primeira inicialização do volume `mysql-data`. Alterar o SQL ou as credenciais depois disso exige tratar o banco existente.

| Variável | Uso |
| --- | --- |
| `APP_ENV` | Sufixo dos nomes dos containers. O padrão é `dev`. |
| `BACKEND_PORT`, `FRONTEND_PORT`, `MYSQL_PORT` | Portas da máquina. Os padrões são `8080`, `3000` e `3306`. Mantenha o frontend em `http://localhost:3000`, a origem liberada no CORS. |
| `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` | Credenciais iniciais do banco. O Compose traz valores para uso local. |
| `NEXT_PUBLIC_API_URL` | Endereço da API no navegador. O padrão é `http://localhost:<BACKEND_PORT>`. Se mudar, reconstrua a imagem do frontend. |
| `SPRING_PROFILES_ACTIVE`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` | Opções do backend. O Compose configura o perfil `mysql` e usa as credenciais do banco por padrão. |

Use `docker compose ps` para conferir os serviços, `docker compose restart backend` para reiniciar só a API e `docker compose stop` para parar os containers. `docker compose down` também remove os containers e a rede, mantendo o volume. A opção `down -v` apaga os dados do MySQL.

O cadastro pela interface cria uma sessão local no navegador. O projeto ainda não autentica por e-mail e senha. Para executar sem MySQL, consulte o perfil `memoria` no [README do backend](backend/README.md). Para rodar o Next.js fora do Docker, consulte o [README do frontend](frontend/README.md).

### Usando Terraform (IaC)

O Terraform usa o Docker local. As portas padrão são as mesmas do Compose, então escolha um dos dois para executar o projeto. Com o Docker ativo e o Terraform instalado, rode na raiz.

```bash
docker compose build backend frontend
terraform -chdir=infra init
terraform -chdir=infra workspace select -or-create local
terraform -chdir=infra validate
terraform -chdir=infra plan
```

O plano usa as imagens `pix-backend:local` e `pix-frontend:local`, prepara a imagem MySQL e prevê a criação da rede, do volume e dos três containers. Após revisar o plano, use `terraform -chdir=infra apply` para provisionar. O workspace `local` separa o novo estado dos arquivos de estado antigos. Se trocar as tags da compilação, ajuste `backend_image` e `frontend_image` no Terraform para os mesmos nomes.

O volume do MySQL desse ambiente é gerenciado pelo Terraform. Um `terraform destroy` pode apagar esse volume e seus dados.

## Fluxo de Git e CI/CD

O projeto usa **Trunk-Based Development**, com a `main` como branch de integração.

1. **Pull Requests:** Funcionalidades são desenvolvidas em branches curtas (`feat/...`) e integradas na `main` somente após revisão de código e aprovação nos checks automáticos.
2. **CI.** Em PRs para a `main`, pushes na `main` e tags `v*`, o GitHub Actions sobe um MySQL de teste com o Compose, roda `./mvnw test` no Java 21 e executa `npm ci`, `npm run lint` e `npm run build` no Node.js 20.
3. **Imagens.** Pushes na `main` e tags `v*` publicam as imagens no GHCR com o `GITHUB_TOKEN` do workflow. A versão recebe `sha-<commit>` ou a tag da release, além de `latest`.
4. **Ambientes.** O workflow valida a configuração do Compose com as imagens publicadas em `development` para pushes na `main` e em `staging` e `production` para tags `v*`. A etapa de produção depende da homologação e segue as regras configuradas no GitHub Environment. Essas etapas executam `docker compose config --quiet`. A publicação de imagens e a validação de configuração são as únicas operações de entrega automatizadas.
