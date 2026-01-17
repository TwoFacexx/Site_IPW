const express = require('express');
const router = express.Router();
const db = require('../db');

// GET todos os alunos
router.get('/', (req, res) => {
    db.query('SELECT * FROM alunos', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// POST criar aluno
router.post('/', (req, res) => {
    const { nome, email } = req.body;
    db.query(
        'INSERT INTO alunos (nome, email) VALUES (?, ?)',
        [nome, email],
        (err, result) => {
            if (err) return res.status(400).json(err);
            res.status(201).json({ id: result.insertId });
        }
    );
});
// UPDATE aluno
router.put('/:id', (req, res) => {
    const { nome, email } = req.body;
    db.query(
        'UPDATE alunos SET nome = ?, email = ? WHERE id = ?',
        [nome, email, req.params.id],
        err => {
            if (err) return res.status(400).json(err);
            res.sendStatus(204);
        }
    );
});

// DELETE aluno
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM alunos WHERE id = ?',
        [req.params.id],
        err => {
            if (err) return res.status(400).json(err);
            res.sendStatus(204);
        });
});
module.exports = router;
