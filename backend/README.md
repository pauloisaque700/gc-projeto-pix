# Backend - Projeto PIX

API REST do Projeto PIX, construída com Java 21 e Spring Boot. O perfil `mysql` grava usuários e contas no banco. O perfil `memoria` continua disponível para rodar a API sem MySQL.

## Executar

### Com conexão MySQL

Defina as variáveis no ambiente do backend e então execute `./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql` a partir de `backend`. No PowerShell, use `.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql`.

| Variável | Valor esperado |
| --- | --- |
| `SPRING_DATASOURCE_URL` | URL JDBC do banco `byebank_db`, por exemplo `jdbc:mysql://<host-mysql>:3306/byebank_db`. Em Docker, use o nome real do serviço MySQL como host. |
| `SPRING_DATASOURCE_USERNAME` | Usuário MySQL configurado para a aplicação. |
| `SPRING_DATASOURCE_PASSWORD` | Senha desse usuário. |

Suba o MySQL e aplique `init.sql` antes de iniciar o backend fora do Docker. Os repositórios usam JDBC e gravam datas e horas em UTC. As rotas de chaves, transferências e extrato PIX continuam disponíveis em `memoria`. Elas ficam desativadas em `mysql` até a etapa de integração do PIX.

Com Docker Compose, rode `docker compose up --build` na raiz do projeto. O backend ativa `mysql` por padrão, usa `mysql:3306` na rede interna e espera o MySQL aceitar uma consulta com o usuário da aplicação antes de iniciar. Para acessar o banco a partir da máquina local, use `127.0.0.1` e a porta `MYSQL_PORT` (padrão `3306`).

O `init.sql` da raiz cria o banco `byebank_db`. A imagem MySQL 8.4 roda esse script na primeira inicialização do volume `mysql-data`. Em um volume existente, editar o SQL ou trocar as variáveis de credenciais não reaplica a inicialização. [Documentação da imagem oficial do MySQL](https://hub.docker.com/_/mysql)

### Em memória, sem MySQL

Use o perfil `memoria` para executar ou testar a API sem um servidor MySQL. Use `mysql` e `memoria` separadamente.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=memoria
```

### Testes com MySQL real

Prepare um banco de teste vazio com `init.sql`. Defina `BYEBANK_TEST_MYSQL_URL`, `BYEBANK_TEST_MYSQL_USER` e `BYEBANK_TEST_MYSQL_PASSWORD` para essa instância e rode `./mvnw test`. Os testes de integração criam dados e reiniciam o contexto do Spring. Sem a URL de teste, essa suíte é ignorada e os testes em memória continuam disponíveis.

## API de usuários

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/api/usuarios` | Cadastra um usuário. |
| `GET` | `/api/usuarios/{id}` | Consulta um usuário. |
| `PUT` | `/api/usuarios/{id}` | Atualiza nome, e-mail e telefone. |
| `DELETE` | `/api/usuarios/{id}` | Remove um usuário. |

Exemplo de cadastro:

```json
{
  "nomeCompleto": "Maria da Silva",
  "tipoDocumento": "CPF",
  "documento": "529.982.247-25",
  "email": "maria@exemplo.com",
  "telefone": "(88) 99999-0000"
}
```

No cadastro e na atualização, `Email` remove espaços nas extremidades e converte o valor para minúsculas com `Locale.ROOT`. Na futura persistência JPA, grave o valor normalizado. O esquema preserva `utf8mb4_bin`, exige minúsculas e garante a unicidade pelo índice de e-mail. O repositório em memória verifica duplicidade apenas por documento.

## API de contas bancárias

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/api/contas` | Cria uma conta para um usuário existente. |
| `GET` | `/api/contas/{id}` | Consulta uma conta. |
| `PUT` | `/api/contas/{id}` | Atualiza agência e número. |
| `DELETE` | `/api/contas/{id}` | Remove uma conta. |
| `GET` | `/api/usuarios/{usuarioId}/contas` | Lista as contas de um usuário. |

Exemplo de criação de conta:

```json
{
  "usuarioId": "substitua-pelo-id-do-usuario",
  "agencia": "0001",
  "tipoConta": "CORRENTE"
}
```

Cada conta recebe um número aleatório de seis dígitos, único na agência, e inicia com saldo `0.00`. A remoção de contas e de usuários é feita em cascata (veja [Cascade de remoção](#cascade-de-remoção)).

## Cascade de remoção

### Política no esquema MySQL

O encerramento é lógico. O usuário pode ser marcado como `ENCERRADO` e a conta como `ENCERRADA`, mantendo os registros e vínculos financeiros. Encerrar um usuário preserva as contas e os vínculos de cotitularidade existentes. O esquema impede novos vínculos de titularidade ou cotitularidade com usuários encerrados e novos cotitulares em contas encerradas.

Ao encerrar uma conta, o banco suspende suas chaves PIX ativas. O esquema bloqueia alterações de saldo durante e após o encerramento, impede a reativação da conta e rejeita a ativação de chaves ou novos PIX pendentes e concluídos nessas contas. As chaves estrangeiras restringem a exclusão física de usuários, contas e transferências com vínculos protegidos, preservando o histórico financeiro e os logs de login.

### Comportamento atual da API

Os endpoints `DELETE` removem os registros fisicamente. No perfil `mysql`, se uma chave estrangeira impedir a remoção, a API devolve `422` e desfaz as exclusões da mesma operação. O encerramento lógico ainda não faz parte do fluxo da API.

- `DELETE /api/contas/{id}` remove, nesta ordem: as transferências PIX em que a conta aparece como origem ou destino, as chaves PIX da conta e, por último, a conta.
- `DELETE /api/usuarios/{id}` remove todas as contas do usuário (cada uma com o cascade acima) e só depois o usuário. Um usuário com contas agora é removido com `204`.
- A remoção não estorna valores. Se a conta removida transferiu para outra conta, o registro some do extrato PIX da conta de destino, mas o saldo dela é mantido.

## Organização

- `domain`: entidades, objetos de valor e contratos do domínio;
- `application`: casos de uso e regras de orquestração;
- `api`: controllers, requests, responses e erros HTTP;
- `infrastructure`: repositórios em memória e repositórios JDBC de usuários e contas.
