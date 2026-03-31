const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Listar — filtra pelo mês atual (ou pelo ?mes= passado pelo Relatórios)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const mes = req.query.mes || new Date().toISOString().substring(0, 7);

    let query = 'SELECT * FROM leads';
    const params = [];
    const conds = [];

    conds.push(`mes_referencia = $${params.length + 1}`);
    params.push(mes);

    if (search) {
      conds.push(`(nome ILIKE $${params.length + 1} OR email ILIKE $${params.length + 2} OR telefone ILIKE $${params.length + 3})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      conds.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (conds.length) query += ' WHERE ' + conds.join(' AND ');
    query += ' ORDER BY criado_em DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar leads:', error);
    res.status(500).json({ error: 'Erro ao listar leads' });
  }
});

// Criar — salva com o mês atual automaticamente
router.post('/', async (req, res) => {
  try {
    const {
      nome,
      telefone = '',
      email = '',
      origem = 'Manual',
      status = 'Novo'
    } = req.body;

    if (!nome) return res.status(400).json({ error: 'Nome e obrigatorio' });

    const mes_referencia = new Date().toISOString().substring(0, 7);

    const result = await pool.query(
      'INSERT INTO leads (nome, telefone, email, origem, status, mes_referencia) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome, telefone, email, origem, status, mes_referencia]
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
      'UPDATE leads SET nome=$1, telefone=$2, email=$3, origem=$4, status=$5 WHERE id=$6',
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
    await pool.query('DELETE FROM leads WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir lead:', error);
    res.status(500).json({ error: 'Erro ao excluir lead' });
  }
});

module.exports = router;