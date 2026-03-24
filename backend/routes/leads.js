const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar (com busca opcional)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM leads';
    const params = [];
    const conds = [];

    if (search) {
      conds.push('(nome ILIKE $1 OR email ILIKE $2 OR telefone ILIKE $3)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      const idx = params.length + 1;
      conds.push(`status = $${idx}`);
      params.push(status);
    }

    if (conds.length) {
      query += ' WHERE ' + conds.join(' AND ');
    }

    query += ' ORDER BY criado_em DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar leads:', error);
    res.status(500).json({ error: 'Erro ao listar leads' });
  }
});

// Criar
router.post('/', async (req, res) => {
  try {
    const {
      nome,
      telefone = '',
      email = '',
      origem = 'Manual',
      status = 'Novo'
    } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome e obrigatorio' });
    }

    const result = await pool.query(
      'INSERT INTO leads (nome, telefone, email, origem, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, telefone, email, origem, status',
      [nome, telefone, email, origem, status]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ error: 'Erro ao criar lead' });
  }
});

// Editar
router.put('/:id', async (req, res) => {
  try {
    const { nome, telefone, email, origem, status } = req.body;

    await pool.query(
      'UPDATE leads SET nome = $1, telefone = $2, email = $3, origem = $4, status = $5 WHERE id = $6',
      [nome, telefone, email, origem, status, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar lead:', error);
    res.status(500).json({ error: 'Erro ao editar lead' });
  }
});

// Excluir
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir lead:', error);
    res.status(500).json({ error: 'Erro ao excluir lead' });
  }
});

module.exports = router;