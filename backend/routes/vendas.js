const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vendas ORDER BY criado_em DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro ao listar vendas' });
  }
});

// Criar
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

    const result = await pool.query(
      'INSERT INTO vendas (cliente, valor, data, status, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cliente, valor, data, status, observacoes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro ao criar venda' });
  }
});

// Editar
router.put('/:id', async (req, res) => {
  try {
    const { cliente, valor, data, status, observacoes } = req.body;

    await pool.query(
      'UPDATE vendas SET cliente=$1, valor=$2, data=$3, status=$4, observacoes=$5 WHERE id=$6',
      [cliente, valor, data, status, observacoes, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar venda:', error);
    res.status(500).json({ error: 'Erro ao editar venda' });
  }
});

// Excluir
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vendas WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir venda:', error);
    res.status(500).json({ error: 'Erro ao excluir venda' });
  }
});

module.exports = router;