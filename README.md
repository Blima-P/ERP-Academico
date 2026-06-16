# ERP Acadêmico - Trabalho N2 

Sistema de gestão acadêmica desenvolvido em **React JS** para a matéria de **Programação Web** (UCB - Terça Noturno).

##  Requisitos Cumpridos

- **Login:** Autenticação com Firebase Auth (e-mail e senha), controle de sessão e logout com confirmação.
- **CRUDs:** Três módulos completos (Create, Read, Update, Delete) usando `useState` e `map()`:
  -  **Alunos** — nome, e-mail, idade, curso (chave estrangeira)
  -  **Cursos** — nome, carga horária, turno
  -  **Matrículas** — aluno, curso (preenchido automaticamente), data, status
- **Relatório:** Tela de relatório com JOIN entre 3 entidades (map + Map), filtros por aluno/curso/status, totalizadores e exportação CSV.
- **Segurança:** Rotas protegidas com componente `RotaPrivada` (redireciona para /login se não autenticado).

##  Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | Framework principal (SPA) |
| React Router DOM 7 | Navegação e rotas protegidas |
| Firebase Auth | Autenticação (login/logout) |
| Cloud Firestore | Banco de dados NoSQL |
| CSS Modules | Estilização isolada por componente |

##  Estrutura do Projeto

```
src/
├── App.js                          # Rotas da aplicação
├── componentes/
│   ├── Layout/                     # Sidebar + Header + Outlet
│   ├── RotaPrivada/                # Proteção de rotas (guard)
│   └── TabelaDados/                # Tabela reutilizável (usado nos 3 CRUDs)
├── contextos/
│   └── ContextoAutenticacao.jsx    # Context API (estado global de login)
├── firebase/
│   ├── configuracao.js             # Conexão com Firebase
│   ├── autenticacao.js             # Login e logout
│   └── banco.js                    # Funções CRUD genéricas (Firestore)
└── paginas/
    ├── Login/                      # Tela de login com validação
    ├── PainelInicial/              # Dashboard com contagens
    ├── Alunos/                     # CRUD de alunos
    ├── Cursos/                     # CRUD de cursos
    ├── Matriculas/                 # CRUD de matrículas
    └── Relatorio/                  # Relatório com JOIN
```

##  Como usar

1. Clone o repositório
2. Crie um arquivo `.env` na pasta `erp-academico/` com as credenciais do Firebase:
   ```
   REACT_APP_FIREBASE_API_KEY=...
   REACT_APP_FIREBASE_AUTH_DOMAIN=...
   REACT_APP_FIREBASE_PROJECT_ID=...
   REACT_APP_FIREBASE_STORAGE_BUCKET=...
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
   REACT_APP_FIREBASE_APP_ID=...
   ```
3. Instale as dependências e inicie:
   ```bash
   cd erp-academico
   npm install
   npm start
   ```

##  Equipe

**Alunos:** Pedro Braga de Lima, Maria Clara Paiva Oliveira Camelo, Maria Clara Ferreira Dos Santos, Nicole Reinaldo De Carvalho

**Professor:** João Evangelista de Souza
