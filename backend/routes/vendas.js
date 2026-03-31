const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar — filtra pelo mês atual (ou ?mes=)
router.get('/', async (req, res) => {
  try {
    const mes = req.query.mes || new Date().toISOString().substring(0, 7);

    const result = await pool.query(
      'SELECT * FROM vendas WHERE mes_referencia = $1 ORDER BY criado_em DESC',
      [mes]
    );

    const vendas = result.rows.map((venda) => ({
      ...venda,
      valor: Number(venda.valor || 0)
    }));

    res.json(vendas);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro ao listar vendas' });
  }
});

// Criar — salva com o mês atual automaticamente
router.post('/', async (req, res) => {
  try {
    const {
      cliente,
      valor = 0,
      data = '',
      status = 'Pendente',
      observacoes = ''
    } = req.body;

    if (!cliente) {
      return res.status(400).json({ error: 'Cliente e obrigatorio' });
    }

    const mes_referencia = new Date().toISOString().substring(0, 7);

    const result = await pool.query(
      `
      INSERT INTO vendas (cliente, valor, data, status, observacoes, mes_referencia)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [cliente, Number(valor || 0), data, status, observacoes, mes_referencia]
    );

    const venda = {
      ...result.rows[0],
      valor: Number(result.rows[0].valor || 0)
    };

    res.json(venda);
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro ao criar venda' });
  }
});

// Editar
router.put('/:id', async (req, res) => {
  try {
    const { cliente, valor, data, status, observacoes } = req.body;

    const result = await pool.query(
      `
      UPDATE vendas
      SET cliente = $1, valor = $2, data = $3, status = $4, observacoes = $5
      WHERE id = $6
      RETURNING *
      `,
      [cliente, Number(valor || 0), data, status, observacoes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venda nao encontrada' });
    }

    const venda = {
      ...result.rows[0],
      valor: Number(result.rows[0].valor || 0)
    };

    res.json(venda);
  } catch (error) {
    console.error('Erro ao editar venda:', error);
    res.status(500).json({ error: 'Erro ao editar venda' });
  }
});

// Excluir
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vendas WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir venda:', error);
    res.status(500).json({ error: 'Erro ao excluir venda' });
  }
});

module.exports = router;