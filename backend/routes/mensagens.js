const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mensagens ORDER BY criado_em DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
});

// Criar
router.post('/', async (req, res) => {
  try {
    const {
      contato,
      mensagem = '',
      tipo = 'Entrada',
      data = ''
    } = req.body;

    if (!contato) {
      return res.status(400).json({ error: 'Contato e obrigatorio' });
    }

    const result = await pool.query(
      'INSERT INTO mensagens (contato, mensagem, tipo, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [contato, mensagem, tipo, data]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

// Editar
router.put('/:id', async (req, res) => {
  try {
    const { contato, mensagem, tipo, data } = req.body;

    await pool.query(
      'UPDATE mensagens SET contato=$1, mensagem=$2, tipo=$3, data=$4 WHERE id=$5',
      [contato, mensagem, tipo, data, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar mensagem:', error);
    res.status(500).json({ error: 'Erro ao editar mensagem' });
  }
});

// Excluir
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM mensagens WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir mensagem:', error);
    res.status(500).json({ error: 'Erro ao excluir mensagem' });
  }
});

module.exports = router;