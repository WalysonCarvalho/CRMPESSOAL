require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initDatabase } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/leads',         require('./routes/leads'));
app.use('/api/captacoes',     require('./routes/captacoes'));
app.use('/api/vendas',        require('./routes/vendas'));
app.use('/api/mensagens',     require('./routes/mensagens'));
app.use('/api/agenda',        require('./routes/agenda'));
app.use('/api/configuracoes', require('./routes/configuracoes'));

// Dashboard — retorna stats do MÊS ATUAL
app.get('/api/dashboard', async (req, res) => {
  try {
    const mes = new Date().toISOString().substring(0, 7);

    const [leadsR, captacoesR, vendasR, configR] = await Promise.all([
      pool.query('SELECT COUNT(*) as c FROM leads     WHERE mes_referencia = $1', [mes]),
      pool.query('SELECT COUNT(*) as c FROM captacoes WHERE mes_referencia = $1', [mes]),
      pool.query('SELECT COUNT(*) as c, COALESCE(SUM(valor), 0) as t FROM vendas WHERE mes_referencia = $1', [mes]),
      pool.query('SELECT chave, valor FROM configuracoes'),
    ]);

    const metas = {};
    configR.rows.forEach(r => { metas[r.chave] = parseFloat(r.valor); });

    res.json({
      stats: {
        totalLeads:        Number(leadsR.rows[0].c),
        totalCaptacoes:    Number(captacoesR.rows[0].c),
        totalVendas:       Number(vendasR.rows[0].c),
        valorTotalVendas:  Number(vendasR.rows[0].t),
      },
      metas
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ erro: 'Erro ao carregar dashboard' });
  }
});

// Meses disponíveis — lista todos os meses que têm algum dado (para o Relatórios)
app.get('/api/meses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT mes_referencia FROM (
        SELECT mes_referencia FROM leads      WHERE mes_referencia != ''
        UNION
        SELECT mes_referencia FROM captacoes  WHERE mes_referencia != ''
        UNION
        SELECT mes_referencia FROM vendas     WHERE mes_referencia != ''
        UNION
        SELECT mes_referencia FROM agenda     WHERE mes_referencia != ''
      ) sub
      ORDER BY mes_referencia DESC
    `);
    res.json(result.rows.map(r => r.mes_referencia));
  } catch (error) {
    console.error('Erro ao listar meses:', error);
    res.status(500).json({ error: 'Erro ao listar meses' });
  }
});

const PORT = process.env.PORT || 3001;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('  ✅ CRM Backend rodando!');
      console.log('  📡 http://localhost:' + PORT);
      console.log('');
    });
  })
  .catch(error => {
    console.error('Erro ao inicializar banco:', error);
  });