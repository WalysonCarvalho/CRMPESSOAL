# CRM Pessoal - Guia de Instalacao

## Estrutura de Pastas

```
crm-pessoal/
├── backend/          → API Node.js + Express + SQLite
│   ├── routes/       → Rotas CRUD
│   ├── database.js   → Configuracao do banco de dados
│   └── server.js     → Servidor Express
└── frontend/         → React + Vite
    └── src/
        ├── context/  → Estado global (atualizacao automatica)
        ├── pages/    → Paginas do sistema
        ├── components/ → Componentes reutilizaveis
        └── services/ → Comunicacao com API
```

## Instalacao (Passo a Passo)

### Requisitos
- Node.js instalado (versao 18 ou superior)
- Download: https://nodejs.org

### Passo 1 — Backend

Abra o terminal na pasta `crm-pessoal/backend` e rode:

```bash
npm install
npm start
```

O backend vai rodar em: http://localhost:3001

### Passo 2 — Frontend

Abra outro terminal na pasta `crm-pessoal/frontend` e rode:

```bash
npm install
npm run dev
```

O sistema vai abrir em: http://localhost:3000

## Funcionalidades

- Dashboard com atualizacao automatica em tempo real
- Leads (criar, editar, excluir, filtrar, buscar)
- Vendas com soma automatica
- Captacao com progresso visual
- Mensagens e Agenda
- Relatorios com graficos
- Configuracoes de metas

## Tecnologias

- Backend: Node.js + Express + SQLite (better-sqlite3)
- Frontend: React + Vite + Recharts + Lucide Icons
