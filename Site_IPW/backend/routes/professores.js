const express = require('express');
const router = express.Router();
const db = require('../db');

// GET todos os professores
router.get('/', (req, res) => {
    db.query('SELECT * FROM professores', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});
// POST criar professor
router.post('/', (req, res) => {
    const { nome, email } = req.body;
    db.query(
        'INSERT INTO professores (nome, email) VALUES (?, ?)',
        [nome, email],
        (err, result) => {
            if (err) return res.status(400).json(err);
            res.status(201).json({ id: result.insertId });
        }
    );
});
// UPDATE professor
router.put('/:id', (req, res) => {
    const { nome, email } = req.body;
    db.query(
        'UPDATE professores SET nome = ?, email = ? WHERE id = ?',
        [nome, email, req.params.id],
        err => {
            if (err) return res.status(400).json(err);
            res.sendStatus(204);
        }
    );
});
// DELETE professor
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM professores WHERE id = ?',
        [req.params.id],
        err => {
            if (err) return res.status(400).json(err);
            res.sendStatus(204);
        });
});

module.exports = router;
