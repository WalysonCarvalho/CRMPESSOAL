const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar configuracoes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM configuracoes ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar configuracoes:', error);
    res.status(500).json({ error: 'Erro ao listar configuracoes' });
  }
});

// Salvar/atualizar configuracoes em lote
router.post('/', async (req, res) => {
  try {
    let configuracoes = req.body;

    // Aceita array:
    // [{ chave: 'meta_leads', valor: 200 }]
    // ou objeto:
    // { meta_leads: 200, meta_captacoes: 8, meta_vendas: 50000 }
    if (!Array.isArray(configuracoes)) {
      if (configuracoes && typeof configuracoes === 'object') {
        configuracoes = Object.entries(configuracoes).map(([chave, valor]) => ({
          chave,
          valor
        }));
      } else {
        return res.status(400).json({ error: 'Formato invalido de configuracoes' });
      }
    }

    for (const item of configuracoes) {
      if (!item.chave) continue;

      await pool.query(
        `INSERT INTO configuracoes (chave, valor)
         VALUES ($1, $2)
         ON CONFLICT (chave)
         DO UPDATE SET valor = EXCLUDED.valor`,
        [item.chave, String(item.valor)]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar configuracoes:', error);
    res.status(500).json({ error: 'Erro ao salvar configuracoes' });
  }
});

// Atualizar uma configuracao por chave
router.put('/:chave', async (req, res) => {
  try {
    const { valor } = req.body;

    await pool.query(
      `INSERT INTO configuracoes (chave, valor)
       VALUES ($1, $2)
       ON CONFLICT (chave)
       DO UPDATE SET valor = EXCLUDED.valor`,
      [req.params.chave, String(valor)]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar configuracao:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuracao' });
  }
});

module.exports = router;