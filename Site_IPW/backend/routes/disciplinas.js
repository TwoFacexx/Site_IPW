const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /disciplinas
router.get('/', (req, res) => {
    db.query('SELECT * FROM disciplinas', (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao obter disciplinas' });
        }
        res.json(result);
    });
});

// POST /disciplinas
router.post('/', (req, res) => {
    const { nome, curso_id } = req.body;

    if (!nome || !curso_id) {
        return res.status(400).json({ error: 'Nome e curso_id são obrigatórios' });
    }

    db.query(
        'INSERT INTO disciplinas (nome, curso_id) VALUES (?, ?)',
        [nome, curso_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao criar disciplina' });
            }
            res.status(201).json({ id: result.insertId });
        }
    );
});

// PUT /disciplinas/:id
router.put('/:id', (req, res) => {
    const { nome, curso_id } = req.body;

    if (!nome || !curso_id) {
        return res.status(400).json({ error: 'Nome e curso_id são obrigatórios' });
    }

    db.query(
        'UPDATE disciplinas SET nome = ?, curso_id = ? WHERE id = ?',
        [nome, curso_id, req.params.id],
        err => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao atualizar disciplina' });
            }
            res.sendStatus(204);
        }
    );
});

// DELETE /disciplinas/:id
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM disciplinas WHERE id = ?',
        [req.params.id],
        err => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao remover disciplina' });
            }
            res.sendStatus(204);
        }
    );
});

module.exports = router;
