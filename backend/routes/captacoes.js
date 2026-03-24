const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM captacoes ORDER BY criado_em DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar captacoes:', error);
    res.status(500).json({ error: 'Erro ao listar captacoes' });
  }
});

// Criar
router.post('/', async (req, res) => {
  try {
    const { titulo, descricao = '', status = 'Em andamento' } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'Titulo e obrigatorio' });
    }

    const result = await pool.query(
      'INSERT INTO captacoes (titulo, descricao, status) VALUES ($1, $2, $3) RETURNING *',
      [titulo, descricao, status]
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