const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL não foi carregada.');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function initDatabase() {
  // ── Tabelas originais ──────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      telefone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      origem TEXT DEFAULT 'Manual',
      status TEXT DEFAULT 'Novo',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS captacoes (
      id SERIAL PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT DEFAULT '',
      status TEXT DEFAULT 'Em andamento',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendas (
      id SERIAL PRIMARY KEY,
      cliente TEXT NOT NULL,
      valor NUMERIC NOT NULL DEFAULT 0,
      data TEXT DEFAULT '',
      status TEXT DEFAULT 'Pendente',
      observacoes TEXT DEFAULT '',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id SERIAL PRIMARY KEY,
      contato TEXT NOT NULL,
      mensagem TEXT DEFAULT '',
      tipo TEXT DEFAULT 'Entrada',
      data TEXT DEFAULT '',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agenda (
      id SERIAL PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT DEFAULT '',
      data TEXT DEFAULT '',
      horario TEXT DEFAULT '',
      tipo TEXT DEFAULT 'Reuniao',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS configuracoes (
      id SERIAL PRIMARY KEY,
      chave TEXT UNIQUE NOT NULL,
      valor TEXT NOT NULL
    );
  `);

  await pool.query(`
    INSERT INTO configuracoes (chave, valor)
    VALUES
      ('meta_leads', '200'),
      ('meta_captacoes', '8'),
      ('meta_vendas', '50000')
    ON CONFLICT (chave) DO NOTHING;
  `);

  // ── Migração: adiciona coluna mes_referencia (seguro — não quebra se já existir) ──
  await pool.query(`ALTER TABLE leads      ADD COLUMN IF NOT EXISTS mes_referencia TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE captacoes  ADD COLUMN IF NOT EXISTS mes_referencia TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE vendas     ADD COLUMN IF NOT EXISTS mes_referencia TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE agenda     ADD COLUMN IF NOT EXISTS mes_referencia TEXT DEFAULT ''`);

  // ── Preenche registros antigos com o mês em que foram criados ──────────────
  await pool.query(`UPDATE leads     SET mes_referencia = TO_CHAR(criado_em, 'YYYY-MM') WHERE mes_referencia = ''`);
  await pool.query(`UPDATE captacoes SET mes_referencia = TO_CHAR(criado_em, 'YYYY-MM') WHERE mes_referencia = ''`);
  await pool.query(`UPDATE vendas    SET mes_referencia = TO_CHAR(criado_em, 'YYYY-MM') WHERE mes_referencia = ''`);
  await pool.query(`UPDATE agenda    SET mes_referencia = TO_CHAR(criado_em, 'YYYY-MM') WHERE mes_referencia = ''`);
}

module.exports = { pool, initDatabase };