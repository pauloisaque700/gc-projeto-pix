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

## Organização

- `domain`: entidades, objetos de valor e contratos do domínio;
- `application`: casos de uso e regras de orquestração;
- `api`: controllers, requests, responses e erros HTTP;
- `infrastructure`: implementação temporária em memória.
