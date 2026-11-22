# Backend - Projeto PIX

API REST do Projeto PIX, construída com Java 21 e Spring Boot. Nesta primeira etapa, a persistência é inteiramente em memória.

## Executar

No PowerShell, dentro de `backend`:

```powershell
.\mvnw.cmd spring-boot:run
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

- `DELETE /api/contas/{id}` remove, nesta ordem: as transferências PIX em que a conta aparece como origem ou destino, as chaves PIX da conta e, por último, a conta.
- `DELETE /api/usuarios/{id}` remove todas as contas do usuário (cada uma com o cascade acima) e só depois o usuário. Um usuário com contas agora é removido com `204`.
- A remoção não estorna valores. Se a conta removida transferiu para outra conta, o registro some do extrato PIX da conta de destino, mas o saldo dela é mantido.

## Organização

- `domain`: entidades, objetos de valor e contratos do domínio;
- `application`: casos de uso e regras de orquestração;
- `api`: controllers, requests, responses e erros HTTP;
- `infrastructure`: implementação temporária em memória.
