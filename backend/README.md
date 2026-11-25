# Backend - Projeto PIX

API REST do Projeto PIX, construída com Java 21 e Spring Boot. O perfil `mysql` grava usuários, contas, chaves e transferências no banco. O perfil `memoria` roda a mesma API sem MySQL.

## Executar

### Com conexão MySQL

Defina as variáveis no ambiente do backend e então execute `./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql` a partir de `backend`. No PowerShell, use `.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql`.

| Variável | Valor esperado |
| --- | --- |
| `SPRING_DATASOURCE_URL` | URL JDBC do banco `byebank_db`. Para o MySQL local do Compose, use `jdbc:mysql://127.0.0.1:3306/byebank_db?serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false` com a porta publicada. Dentro do Docker, use `mysql:3306`. |
| `SPRING_DATASOURCE_USERNAME` | Usuário MySQL configurado para a aplicação. |
| `SPRING_DATASOURCE_PASSWORD` | Senha desse usuário. |

Suba o MySQL e aplique `init.sql` antes de iniciar o backend fora do Docker. Os repositórios usam JDBC e gravam datas e horas em UTC.

Com Docker Compose, rode `docker compose up --build` na raiz do projeto. O backend ativa `mysql` por padrão, usa `mysql:3306` na rede interna e espera o MySQL aceitar uma consulta com o usuário da aplicação antes de iniciar. Para acessar o banco a partir da máquina local, use `127.0.0.1` e a porta `MYSQL_PORT` (padrão `3306`).

O `init.sql` da raiz cria o banco `byebank_db`. A imagem MySQL 8.4 roda esse script na primeira inicialização do volume `mysql-data`. Em um volume existente, editar o SQL ou trocar as variáveis de credenciais não reaplica a inicialização. [Documentação da imagem oficial do MySQL](https://hub.docker.com/_/mysql)

### Em memória, sem MySQL

Use o perfil `memoria` para executar ou testar a API sem um servidor MySQL. Use `mysql` e `memoria` separadamente.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=memoria
```

### Testes com MySQL real

Prepare um banco de teste vazio com `init.sql`. Defina `BYEBANK_TEST_MYSQL_URL`, `BYEBANK_TEST_MYSQL_USER` e `BYEBANK_TEST_MYSQL_PASSWORD` para essa instância e rode `./mvnw test`. Os testes de integração criam dados e reiniciam o contexto do Spring. O CI sobe apenas o serviço MySQL do Compose para rodar essa suíte junto com os testes em memória. Sem a URL de teste, o Maven executa só os testes em memória.

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

No cadastro e na atualização, o backend remove espaços no início e no fim do e-mail e converte o valor para minúsculas. O repositório JDBC grava o e-mail normalizado, e o MySQL garante que ele seja único. O repositório em memória verifica duplicidade apenas por documento.

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

Cada conta recebe um número aleatório de seis dígitos, único na agência, e inicia com saldo `0.00`. As regras de exclusão variam conforme o perfil. [Cascade de remoção](#cascade-de-remoção)

## PIX no MySQL

Débito, crédito e registro do PIX fazem parte da mesma transação. O MySQL bloqueia as contas com `SELECT ... FOR UPDATE` em ordem de UUID. A transação usa `READ COMMITTED` para conferir o saldo e o total do dia após obter os bloqueios. Se alguma etapa falhar, a transação desfaz a operação inteira.

O extrato lê os PIX concluídos em que a conta aparece como origem ou destino. Chaves suspensas continuam guardadas e ficam indisponíveis para receber PIX. Edição e desbloqueio de chaves seguem sem rotas na API atual.

## Cascade de remoção

### Política no esquema MySQL

O encerramento é lógico. O usuário pode ser marcado como `ENCERRADO` e a conta como `ENCERRADA`, mantendo os registros e vínculos financeiros. Encerrar um usuário preserva as contas e os vínculos de cotitularidade existentes. O esquema impede novos vínculos de titularidade ou cotitularidade com usuários encerrados e novos cotitulares em contas encerradas.

Ao encerrar uma conta, o banco suspende suas chaves PIX ativas. O esquema bloqueia alterações de saldo durante e após o encerramento, impede a reativação da conta e rejeita a ativação de chaves ou novos PIX pendentes e concluídos nessas contas. As chaves estrangeiras restringem a exclusão física de usuários, contas e transferências com vínculos protegidos, preservando o histórico financeiro e os logs de login.

### Comportamento atual da API

Os endpoints `DELETE` removem os registros fisicamente. No perfil `mysql`, uma conta com transferências registradas fica protegida contra exclusão. Se houver histórico de PIX ou outra chave estrangeira impedir a remoção, a API devolve `422` e desfaz as exclusões da mesma operação. O encerramento lógico ainda não faz parte do fluxo da API.

- `DELETE /api/contas/{id}` remove as chaves e depois a conta. Em `memoria`, também remove as transferências associadas antes da conta.
- `DELETE /api/usuarios/{id}` remove as contas do usuário e depois o cadastro. Uma remoção bem-sucedida retorna `204`.
- Em `memoria`, a transferência removida some do extrato da outra conta. O saldo dessa conta continua igual.

## Organização

- `domain`: entidades, objetos de valor e contratos do domínio;
- `application`: casos de uso e regras de orquestração;
- `api`: controllers, requests, responses e erros HTTP;
- `infrastructure`: repositórios em memória e repositórios JDBC de usuários, contas, chaves e transferências.
