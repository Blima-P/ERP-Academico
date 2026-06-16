# ERP Acadêmico — App React 

Aplicação frontend do sistema ERP Acadêmico.

## Scripts Disponíveis

### `npm start`
Roda o app em modo de desenvolvimento em [http://localhost:3000](http://localhost:3000).

### `npm run build`
Gera a versão de produção otimizada na pasta `build/`.

## Configuração

Crie um arquivo `.env` na raiz desta pasta com as credenciais do Firebase:

```env
REACT_APP_FIREBASE_API_KEY=sua_chave
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=seu_projeto
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123:web:abc
```

> ⚠️ O arquivo `.env` está no `.gitignore` — cada dev precisa criar o seu.

## Estrutura de Pastas

```
src/
├── App.js                      # Definição de rotas (React Router)
├── index.js                    # Entry point
├── index.css                   # Estilos globais
├── componentes/
│   ├── Layout/                 # Sidebar + Header + Outlet (estrutura visual)
│   ├── RotaPrivada/            # Guard que bloqueia acesso sem login
│   └── TabelaDados/            # Tabela reutilizável para os 3 CRUDs
├── contextos/
│   └── ContextoAutenticacao.jsx  # Context API — estado global de auth
├── firebase/
│   ├── configuracao.js         # initializeApp + exports de auth e db
│   ├── autenticacao.js         # entrarComEmail, sairDoSistema
│   └── banco.js                # CRUD genérico: criar, buscar, atualizar, excluir
└── paginas/
    ├── Login/                  # Formulário de login com validação
    ├── PainelInicial/          # Dashboard com cards e últimas matrículas
    ├── Alunos/                 # CRUD — campos: nome, email, idade, curso_id
    ├── Cursos/                 # CRUD — campos: nome, carga_horaria, turno
    ├── Matriculas/             # CRUD — campos: aluno_id, curso_id, data, status
    └── Relatorio/              # JOIN (map + Map.get) com filtros e export CSV
```

## Dependências Principais

| Pacote | Versão | Função |
|--------|--------|--------|
| react | 19.2.6 | Framework UI |
| react-router-dom | 7.15.1 | Navegação SPA |
| firebase | 12.13.0 | Auth + Firestore |
