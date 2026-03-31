const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar — filtra pelo mês atual (ou ?mes=)
router.get('/', async (req, res) => {
  try {
    const mes = req.query.mes || new Date().toISOString().substring(0, 7);
    const result = await pool.query(
      'SELECT * FROM captacoes WHERE mes_referencia = $1 ORDER BY criado_em DESC',
      [mes]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar captacoes:', error);
    res.status(500).json({ error: 'Erro ao listar captacoes' });
  }
});

// Criar — salva com o mês atual automaticamente
router.post('/', async (req, res) => {
  try {
    const { titulo, descricao = '', status = 'Em andamento' } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Titulo e obrigatorio' });

    const mes_referencia = new Date().toISOString().substring(0, 7);

    const result = await pool.query(
      'INSERT INTO captacoes (titulo, descricao, status, mes_referencia) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, descricao, status, mes_referencia]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar captacao:', error);
    res.status(500).json({ error: 'Erro ao criar captacao' });
  }
});

// Editar
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descricao, status } = req.body;
    await pool.query(
      'UPDATE captacoes SET titulo=$1, descricao=$2, status=$3 WHERE id=$4',
      [titulo, descricao, status, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar captacao:', error);
    res.status(500).json({ error: 'Erro ao editar captacao' });
  }
});

// Excluir
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM captacoes WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir captacao:', error);
    res.status(500).json({ error: 'Erro ao excluir captacao' });
  }
});

module.exports = router;