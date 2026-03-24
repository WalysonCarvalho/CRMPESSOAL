require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initDatabase } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/leads', require('./routes/leads'));
app.use('/api/captacoes', require('./routes/captacoes'));
app.use('/api/vendas', require('./routes/vendas'));
app.use('/api/mensagens', require('./routes/mensagens'));
app.use('/api/agenda', require('./routes/agenda'));
app.use('/api/configuracoes', require('./routes/configuracoes'));

// Dashboard: retorna todos os stats de uma vez
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalLeadsResult = await pool.query('SELECT COUNT(*) as c FROM leads');
    const totalCaptacoesResult = await pool.query('SELECT COUNT(*) as c FROM captacoes');
    const vendasStatsResult = await pool.query(
      'SELECT COUNT(*) as c, COALESCE(SUM(valor), 0) as t FROM vendas'
    );
    const configRowsResult = await pool.query('SELECT chave, valor FROM configuracoes');

    const totalLeads = Number(totalLeadsResult.rows[0].c);
    const totalCaptacoes = Number(totalCaptacoesResult.rows[0].c);
    const totalVendas = Number(vendasStatsResult.rows[0].c);
    const valorTotalVendas = Number(vendasStatsResult.rows[0].t);

    const metas = {};
    configRowsResult.rows.forEach((r) => {
      metas[r.chave] = parseFloat(r.valor);
    });

    res.json({
      stats: {
        totalLeads,
        totalCaptacoes,
        totalVendas,
        valorTotalVendas
      },
      metas
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ erro: 'Erro ao carregar dashboard' });
  }
});

const PORT = 3001;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('  ✅ CRM Backend rodando!');
      console.log('  📡 http://localhost:' + PORT);
      console.log('');
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar banco:', error);
  });