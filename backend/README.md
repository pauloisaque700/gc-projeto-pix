# Backend - Projeto PIX

API REST do Projeto PIX, construída com Java 21 e Spring Boot. Nesta primeira etapa, a persistência é inteiramente em memória.

## Executar

### Com conexão MySQL

Defina as variáveis no ambiente do backend e então execute `./mvnw spring-boot:run` a partir de `backend`. No PowerShell, use `.\mvnw.cmd spring-boot:run`.

| Variável | Valor esperado |
| --- | --- |
| `SPRING_DATASOURCE_URL` | URL JDBC do banco `byebank_db`, por exemplo `jdbc:mysql://<host-mysql>:3306/byebank_db`. Em Docker, use o nome real do serviço MySQL como host. |
| `SPRING_DATASOURCE_USERNAME` | Usuário MySQL configurado para a aplicação. |
| `SPRING_DATASOURCE_PASSWORD` | Senha desse usuário. |

O MySQL deve estar acessível antes da inicialização do backend. A conexão JDBC está preparada e o Hibernate usa UTC para operações de data e hora via JDBC. Os repositórios da aplicação continuam em memória nesta etapa. A persistência das operações no MySQL depende da futura implementação dos repositórios JPA.

O `init.sql` da raiz cria o esquema para MySQL 8.0.16 ou superior. A integração com Docker Compose ainda precisa fornecer o serviço MySQL, o volume de dados, as credenciais por variáveis de ambiente e a montagem de `init.sql` em `/docker-entrypoint-initdb.d/`. Também precisa de um `healthcheck` e de uma dependência que aguarde o banco saudável antes de iniciar o backend. A imagem oficial aplica o script na primeira inicialização de um volume vazio. O ambiente MySQL é responsável pelo esquema. [Documentação da imagem oficial do MySQL](https://hub.docker.com/_/mysql)

### Em memória, sem MySQL

Use o perfil opcional `memoria` para executar ou testar a API sem um servidor MySQL. Na integração Docker com MySQL, use a configuração JDBC acima com esse perfil desativado.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=memoria
```

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
  "numero": "123456"
}
```

Cada conta inicia com saldo `0.00`. A remoção de contas e de usuários é feita em cascata na API em memória (veja [Cascade de remoção](#cascade-de-remoção)).

## API PIX

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/api/chaves-pix` | Associa CPF, CNPJ, e-mail ou telefone a uma conta. |
| `POST` | `/api/chaves-pix/aleatoria` | Gera e associa uma chave aleatória. |
| `POST` | `/api/chaves-pix/validar` | Verifica o formato e a disponibilidade da chave. |
| `GET` | `/api/chaves-pix/resolver` | Consulta a chave pelo valor e identifica seu titular. |
| `GET` | `/api/chaves-pix/{id}` | Consulta uma chave pelo ID. |
| `GET` | `/api/contas/{contaId}/chaves-pix` | Lista as chaves da conta. |
| `DELETE` | `/api/chaves-pix/{id}` | Remove uma chave PIX. |
| `POST` | `/api/pix/transferencias` | Transfere entre contas usando a chave de destino. |
| `POST` | `/api/pix/recebimentos-externos` | Simula o recebimento de um PIX externo. |
| `GET` | `/api/pix/transferencias/{id}` | Consulta uma transferência. |
| `GET` | `/api/contas/{contaId}/extrato-pix` | Lista as transferências da conta. |

## Cascade de remoção

### Política no esquema MySQL

O encerramento é lógico. O usuário pode ser marcado como `ENCERRADO` e a conta como `ENCERRADA`, mantendo os registros e vínculos financeiros. Ao encerrar uma conta, o banco suspende suas chaves PIX ativas. O esquema rejeita a ativação de chaves, mudanças de saldo em contas já encerradas e PIX pendentes ou concluídos que iniciem ou mudem para essas contas. As chaves estrangeiras restringem a exclusão física de titulares, contas e transferências que tenham vínculos protegidos. Encerrar a conta ou o usuário preserva as transferências e os estornos existentes.

### Comportamento atual da API em memória

Os endpoints `DELETE` ainda removem registros fisicamente em memória. O encerramento lógico no fluxo da API depende da futura integração com os repositórios JPA.

- `DELETE /api/contas/{id}` remove, nesta ordem: as transferências PIX em que a conta aparece como origem ou destino, as chaves PIX da conta e, por último, a conta.
- `DELETE /api/usuarios/{id}` remove todas as contas do usuário (cada uma com o cascade acima) e só depois o usuário. Um usuário com contas agora é removido com `204`.
- A remoção não estorna valores. Se a conta removida transferiu para outra conta, o registro some do extrato PIX da conta de destino, mas o saldo dela é mantido.

## Organização

- `domain`: entidades, objetos de valor e contratos do domínio;
- `application`: casos de uso e regras de orquestração;
- `api`: controllers, requests, responses e erros HTTP;
- `infrastructure`: implementação temporária em memória.
