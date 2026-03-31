const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar — filtra pelo mês atual (ou ?mes=)
router.get('/', async (req, res) => {
  try {
    const mes = req.query.mes || new Date().toISOString().substring(0, 7);
    const result = await pool.query(
      'SELECT * FROM agenda WHERE mes_referencia = $1 ORDER BY criado_em DESC',
      [mes]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar agenda:', error);
    res.status(500).json({ error: 'Erro ao listar agenda' });
  }
});

// Criar — salva com o mês atual automaticamente
router.post('/', async (req, res) => {
  try {
    const { titulo, descricao = '', data = '', horario = '', tipo = 'Reuniao' } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Titulo e obrigatorio' });

    const mes_referencia = new Date().toISOString().substring(0, 7);

    const result = await pool.query(
      'INSERT INTO agenda (titulo, descricao, data, horario, tipo, mes_referencia) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, descricao, data, horario, tipo, mes_referencia]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar item da agenda:', error);
    res.status(500).json({ error: 'Erro ao criar item da agenda' });
  }
});

// Editar
router.put('/:id', async (req, res) => {
  try {
    const { titulo, descricao, data, horario, tipo } = req.body;
    await pool.query(
      'UPDATE agenda SET titulo=$1, descricao=$2, data=$3, horario=$4, tipo=$5 WHERE id=$6',
      [titulo, descricao, data, horario, tipo, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar agenda:', error);
    res.status(500).json({ error: 'Erro ao editar agenda' });
  }
});

// Excluir
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM agenda WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir agenda:', error);
    res.status(500).json({ error: 'Erro ao excluir agenda' });
  }
});

module.exports = router;