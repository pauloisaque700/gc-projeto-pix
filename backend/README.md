# Backend - Projeto PIX

Este é o backend do Projeto PIX. A API usa Java 21 e Spring Boot. Por enquanto, os dados ficam em memória.

## Executar

### Com conexão MySQL

Defina as variáveis no ambiente do backend e então execute `./mvnw spring-boot:run` a partir de `backend`. No PowerShell, use `.\mvnw.cmd spring-boot:run`.

| Variável | Valor esperado |
| --- | --- |
| `SPRING_DATASOURCE_URL` | URL JDBC do banco `byebank_db`, por exemplo `jdbc:mysql://<host-mysql>:3306/byebank_db`. Em Docker, use o nome real do serviço MySQL como host. |
| `SPRING_DATASOURCE_USERNAME` | Usuário MySQL configurado para a aplicação. |
| `SPRING_DATASOURCE_PASSWORD` | Senha desse usuário. |

Para usar a conexão JDBC, suba o MySQL antes do backend. O Hibernate usa UTC nas datas e horas que passam por essa conexão. As operações da API continuam em memória. Para gravar os dados no MySQL, ainda faltam os repositórios JPA.

O `init.sql` da raiz cria as tabelas no MySQL 8.0.16 ou superior. Para ligar o MySQL ao Docker Compose, ainda faltam o serviço do banco, um volume para os dados e as credenciais por variáveis de ambiente. Monte o script em `/docker-entrypoint-initdb.d/`. Use um `healthcheck` no banco e configure o backend para esperar o banco ficar pronto. A imagem oficial roda o script na primeira vez que sobe com o volume vazio. [Documentação da imagem oficial do MySQL](https://hub.docker.com/_/mysql)

### Em memória, sem MySQL

Use o perfil `memoria` para rodar e testar a API sem subir o MySQL. Para rodar com MySQL no Docker, use a configuração JDBC acima e deixe esse perfil desativado.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=memoria
```

## Identidade e autorização

O sistema não tem login real com JWT ou sessão no backend. O frontend salva o ID do usuário no `localStorage` para simular a sessão. Isso é uma limitação conhecida do trabalho acadêmico.

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

Ao cadastrar ou atualizar um usuário, a API tira os espaços do começo e do fim do e-mail e coloca tudo em minúsculas. O esquema do MySQL usa `utf8mb4_bin`, exige e-mails em minúsculas e barra e-mails repetidos. Quando os repositórios JPA forem implementados, eles devem salvar o e-mail já tratado. Em memória, só o documento é conferido para evitar cadastros repetidos.

## API de contas bancárias

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/api/contas` | Cria uma conta para um usuário existente. |
| `GET` | `/api/contas/{id}` | Consulta uma conta. |
| `PUT` | `/api/contas/{id}` | Atualiza a agência. Se informado, `numero` deve ser igual ao número atual. |
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

Cada conta começa com saldo `0.00` e recebe um número aleatório de seis dígitos. Esse número não pode se repetir na mesma agência. O que acontece ao apagar uma conta ou um usuário está na seção [Cascade de remoção](#cascade-de-remoção).

## Atomicidade do PIX

Se der erro no meio do PIX, o Java desfaz as mudanças nos saldos e apaga o registro da transferência se ele chegou a ser salvo. Por exemplo, se a conta de destino estiver bloqueada, o PIX falha e o dinheiro fica na conta de origem.

A mesma regra vale para o recebimento de PIX externo. Esse controle funciona em memória, dentro de uma instância da aplicação.

## Cascade de remoção

### Comportamento atual da API em memória

- `DELETE /api/contas/{id}` apaga primeiro os PIX que a conta enviou ou recebeu. Depois, apaga as chaves PIX e a própria conta.
- `DELETE /api/usuarios/{id}` remove todas as contas do usuário da mesma forma. Depois, apaga o usuário e devolve `204`.
- Apagar a conta não devolve o dinheiro de PIX já feitos. O PIX some do extrato da outra conta, mas o saldo dela continua igual.

## Organização

- `domain` reúne as classes e regras de usuários, contas e PIX.
- `application` reúne os serviços que executam as operações.
- `api` reúne as rotas HTTP e os dados que elas recebem e devolvem.
- `infrastructure` contém os repositórios em memória.
