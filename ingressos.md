# Sistema de Controle de Ingressos — IFMA Campus Coelho Neto

## Visão Geral

Sistema web para gerenciar emissão, distribuição e validação de ingressos para eventos realizados no IFMA Campus Coelho Neto. O sistema permite cadastrar eventos, categorias de ingressos, emitir ingressos com código único e validar entradas via código na portaria.

---

## Tecnologias

| Camada     | Tecnologia                                  |
|------------|----------------------------------------------|
| Back-end   | Node.js + Express + Sequelize (ES6 Modules) |
| Banco      | MariaDB                                      |
| Front-end  | Vue.js 3 + Bootstrap 5 + Font Awesome 6     |
| Bundler    | Vite                                         |
| Auth       | JWT (JSON Web Token)                         |

---

## Estrutura de Pastas

```
ingressos/
├── back/                        # Servidor Node.js
│   ├── index.js                 # Ponto de entrada — inicializa Express e conecta ao banco
│   ├── .env                     # Variáveis de ambiente reais (não vai para o git)
│   ├── .env.local               # Modelo de variáveis (vai para o git)
│   ├── package.json
│   ├── config/
│   │   ├── database.js          # Configuração do Sequelize com MariaDB
│   │   └── criarBanco.js        # Script para criar o banco e inserir dados iniciais
│   ├── model/
│   │   ├── index.js             # Importa todos os models e define associações
│   │   ├── Usuario.js
│   │   ├── Evento.js
│   │   ├── Categoria.js
│   │   ├── Ingresso.js
│   │   └── Comissao.js
│   ├── controller/
│   │   ├── UsuarioController.js
│   │   ├── EventoController.js
│   │   ├── CategoriaController.js
│   │   ├── IngressoController.js
│   │   └── ComissaoController.js
│   ├── routes/
│   │   ├── usuario.routes.js
│   │   ├── evento.routes.js
│   │   ├── categoria.routes.js
│   │   ├── ingresso.routes.js
│   │   └── comissao.routes.js
│   ├── helpers/
│   │   ├── auth.js              # Gerar/verificar JWT
│   │   ├── uuid.js              # Utilitário para gerar UUIDs em contextos pontuais
│   │   └── resposta.js          # Padronizar respostas JSON
│   └── view/                    # Reservado para futuras views server-side
│
└── front/                       # Aplicação Vue.js
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env                     # Variáveis reais (não vai para o git)
    ├── .env.local               # Modelo (vai para o git)
    └── src/
        ├── main.js              # Ponto de entrada Vue
        ├── App.vue              # Componente raiz com NavBar
        ├── router.js            # Rotas do Vue Router
        ├── assets/              # Imagens, fontes, CSS global
        ├── components/
        │   ├── NavBar.vue       # Barra de navegação principal
        │   ├── Alerta.vue       # Componente de alertas reutilizável
        │   └── Carregando.vue   # Spinner de carregamento
        ├── views/
        │   ├── LoginView.vue
        │   ├── EventosView.vue
        │   ├── EventoDetalheView.vue
        │   ├── CategoriasView.vue
        │   ├── UsuariosView.vue
        │   └── ValidarIngressoView.vue
        └── services/
            ├── api.js           # Instância Axios com interceptors
            ├── auth.service.js
            ├── eventos.service.js
            ├── categorias.service.js
            └── ingressos.service.js
```

---

## Banco de Dados

### Diagrama de Tabelas

```
usuarios ──────────────────┐
  id UUID PK               │
  nome VARCHAR(45)         │
  email VARCHAR(100)       │
  senha VARCHAR(255)       ├──< comissoes
  categoria INT            │     id UUID PK
  status VARCHAR(45)       │     categoria INT
                           │     usuarios_id UUID (FK)
                           │     eventos_id UUID (FK)
eventos ───────────────────┤
  id UUID PK               │
  descricao VARCHAR(100)   │
  inicio DATETIME          │
  fim DATETIME             ├──< ingressos
  status INT               │     id UUID PK
                           │     codigo VARCHAR(100)
                           │     descricao VARCHAR(100)
categorias ────────────────┘     status INT
  id UUID PK                     qrcode TEXT
  descricao VARCHAR(45)          categorias_id UUID (FK)
  status INT                     eventos_id UUID (FK)
```

### Descrição das tabelas

| Tabela      | Finalidade |
|-------------|------------|
| `usuarios`  | Usuários do sistema (admins, operadores) |
| `eventos`   | Eventos cadastrados no campus |
| `categorias`| Tipos de ingresso (Ex: Estudante, Professor, Visitante) |
| `ingressos` | Ingressos emitidos, ligados a um evento e categoria |
| `comissoes` | Membros que organizam ou trabalham em cada evento |

### Campos de status

- **usuarios.categoria**: `1`=Admin, `2`=Operador, `3`=Visitante
- **eventos.status / categorias.status**: `1`=Ativo, `0`=Inativo
- **ingressos.status**: `1`=Disponível, `2`=Usado, `0`=Cancelado
- **comissoes.categoria**: `1`=Organizador, `2`=Voluntário, `3`=Palestrante

---

## API — Endpoints

Base URL: `http://localhost:3000/api`

> Rotas marcadas com 🔒 exigem o header `Authorization: Bearer <token>`

### Autenticação

| Método | Rota                    | Descrição              |
|--------|-------------------------|------------------------|
| POST   | `/usuarios/login`       | Realiza login          |

### Usuários 🔒

| Método | Rota               | Descrição               |
|--------|--------------------|-------------------------|
| GET    | `/usuarios`        | Lista todos             |
| GET    | `/usuarios/:id`    | Busca por ID            |
| POST   | `/usuarios`        | Cria novo usuário       |
| PUT    | `/usuarios/:id`    | Atualiza usuário        |
| DELETE | `/usuarios/:id`    | Desativa usuário        |

### Eventos

| Método | Rota              | Descrição               |
|--------|-------------------|-------------------------|
| GET    | `/eventos`        | Lista todos (público)   |
| GET    | `/eventos/:id`    | Busca com ingressos     |
| POST   | `/eventos` 🔒     | Cria evento             |
| PUT    | `/eventos/:id` 🔒 | Atualiza evento         |
| DELETE | `/eventos/:id` 🔒 | Desativa evento         |

### Categorias

| Método | Rota                 | Descrição          |
|--------|----------------------|--------------------|
| GET    | `/categorias`        | Lista ativas       |
| GET    | `/categorias/:id`    | Busca por ID       |
| POST   | `/categorias` 🔒     | Cria categoria     |
| PUT    | `/categorias/:id` 🔒 | Atualiza           |
| DELETE | `/categorias/:id` 🔒 | Desativa           |

### Ingressos 🔒

| Método | Rota                          | Descrição                    |
|--------|-------------------------------|------------------------------|
| GET    | `/ingressos?eventos_id=X`     | Lista (filtra por evento)    |
| GET    | `/ingressos/codigo/:codigo`   | Busca por código             |
| POST   | `/ingressos`                  | Emite ingresso               |
| PATCH  | `/ingressos/validar/:codigo`  | Valida ingresso na entrada   |
| DELETE | `/ingressos/:id`              | Cancela ingresso             |

### Comissões 🔒

| Método | Rota                           | Descrição                  |
|--------|--------------------------------|----------------------------|
| GET    | `/comissoes?eventos_id=X`      | Lista por evento           |
| POST   | `/comissoes`                   | Adiciona membro            |
| DELETE | `/comissoes/:id`               | Remove membro              |

### Formato padrão de resposta

```json
{
  "sucesso": true,
  "mensagem": "OK",
  "dados": { ... }
}
```

Em caso de erro:
```json
{
  "sucesso": false,
  "mensagem": "Descrição do erro",
  "detalhes": "mensagem técnica (opcional)"
}
```

---

## Como executar

### Pré-requisitos

- Node.js 18+
- MariaDB instalado e rodando

### Back-end

```bash
cd back

# 1. Instalar dependências
npm install

# 2. Criar arquivo .env baseado no .env.local
cp .env.local .env
# Edite o .env com seus dados de banco e JWT_SECRET

# 3. Criar o banco, tabelas e dados iniciais
npm run db:criar

# 4. Iniciar o servidor
npm run dev
```

> O script `db:criar` cria automaticamente o banco no MariaDB, sincroniza todas as tabelas e insere:
> - Usuário admin padrão: `admin@ifma.edu.br` / `admin123`
> - Categorias: Estudante, Professor, Servidor, Visitante, Palestrante
> - Um evento de exemplo
>
> ⚠️ Use `db:criar` apenas na configuração inicial — ele recria as tabelas do zero (`force: true`).

### Front-end

```bash
cd front

# 1. Instalar dependências
npm install

# 2. Criar arquivo .env
cp .env.local .env
# Ajuste VITE_API_URL se necessário

# 3. Iniciar
npm run dev
```

Acesse: `http://localhost:5173`

---

## Padrões de código

### IDs com UUID

Todos os campos `id` usam o tipo `DataTypes.UUID` com `defaultValue: DataTypes.UUIDV4`. O Sequelize gera o UUID automaticamente antes de cada `INSERT` — **não é necessário** informar o `id` ao criar registros.

```js
// model/Evento.js
id: {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true,
}

// controller/EventoController.js — sem id no create()
const evento = await Evento.create({ descricao, inicio, fim, status });
```

O arquivo `helpers/uuid.js` permanece disponível para gerar UUIDs em contextos pontuais fora do Sequelize (ex: o código único do ingresso).

---

### ES6 Modules

Todo o projeto usa `import/export` — **não** use `require()` ou `module.exports`.

```js
// Correto
import express from 'express';
export default router;

// Errado
const express = require('express');
module.exports = router;
```

### Padrão de resposta no back-end

Use sempre os helpers `sucesso()` e `erro()` de `helpers/resposta.js`:

```js
import { sucesso, erro } from '../helpers/resposta.js';

// Em caso de sucesso:
return sucesso(res, dados, 'Criado com sucesso', 201);

// Em caso de erro:
return erro(res, 'Registro não encontrado', 404);
```

### Services no front-end

Toda comunicação com a API deve passar por um arquivo em `src/services/`, nunca diretamente nas views:

```js
// services/eventos.service.js
import api from './api.js';
export const listarEventos = () => api.get('/eventos');

// EventosView.vue
import { listarEventos } from '../services/eventos.service.js';
const { data } = await listarEventos();
```

### Login com Google (OAuth 2.0)

O fluxo utilizado é o **Google Identity Services (GSI)** — sem redirecionamentos, tudo dentro da SPA:

1. O script `https://accounts.google.com/gsi/client` é carregado no `index.html`
2. O botão do Google é renderizado no `LoginView.vue` via `google.accounts.id.renderButton()`
3. Ao clicar, o Google retorna um `credential` (ID token JWT do Google)
4. O front-end envia esse `credential` para `POST /api/usuarios/login/google`
5. O back-end verifica o token com `google-auth-library` (`OAuth2Client.verifyIdToken`)
6. Se o e-mail ainda não existe no banco, um novo usuário é criado automaticamente com `categoria: 3` (Visitante)
7. O back-end emite o JWT interno do sistema normalmente

**Configurar o Google Client ID:**

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto → APIs e Serviços → Credenciais → Criar credencial → ID do cliente OAuth 2.0
3. Tipo: **Aplicativo Web**
4. Origens JS autorizadas: `http://localhost:5173` (dev) e o domínio de produção
5. Copie o Client ID gerado e adicione nos dois `.env`:

```
# back/.env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com

# front/.env
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

---

### Autenticação JWT

O token é salvo em `localStorage` com a chave `token`. O interceptor do Axios (`services/api.js`) o envia automaticamente em toda requisição.

---

## Fluxo principal do sistema

```
1. Administrador faz login
2. Cria categorias (Ex: "Estudante", "Professor")
3. Cria um evento com data de início e fim
4. Emite ingressos para o evento, associando uma categoria
5. Sistema gera um código único (ING-XXXXXXXXX)
6. Na portaria, operador acessa /validar e digita o código
7. Sistema marca o ingresso como "Usado" (status 2)
```

---

## Variáveis de ambiente

### back/.env

| Variável     | Descrição                                |
|--------------|-------------------------------------------|
| `DB_HOST`    | Endereço do banco MariaDB                 |
| `DB_PORT`    | Porta (padrão: 3306)                      |
| `DB_NAME`    | Nome do banco de dados                    |
| `DB_USER`    | Usuário do banco                          |
| `DB_PASS`    | Senha do banco                            |
| `JWT_SECRET`        | Chave secreta para assinar tokens JWT        |
| `PORT`              | Porta do servidor Express (padrão: 3000)     |
| `GOOGLE_CLIENT_ID`  | Client ID OAuth 2.0 do Google Cloud Console  |

### front/.env

| Variável        | Descrição                           |
|-----------------|--------------------------------------|
| `VITE_API_URL`          | URL base da API (ex: `/api` ou URL completa)      |
| `VITE_GOOGLE_CLIENT_ID` | Client ID OAuth 2.0 (mesmo valor do back-end)     |
