const express = require('express');
const router = express.Router();
const db = require('../db');

// GET todos os cursos
router.get('/', (req, res) => {
    db.query('SELECT * FROM cursos', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// POST criar curso
router.post('/', (req, res) => {
    const { nome, professor_id } = req.body;
    db.query(
        'INSERT INTO cursos (nome, professor_id) VALUES (?, ?)',
        [nome, professor_id],
        (err, result) => {
            if (err) return res.status(400).json(err);
            res.status(201).json({ id: result.insertId });
        }
    );
});

// UPDATE curso
router.put('/:id', (req, res) => {
    const { nome, professor_id } = req.body;
    db.query(
        'UPDATE cursos SET nome = ?, professor_id = ? WHERE id = ?',
        [nome, professor_id, req.params.id],
        err => {
            if (err) return res.status(400).json(err);
            res.sendStatus(204);
        }
    );
});
// DELETE curso
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM cursos WHERE id = ?',
        [req.params.id],
        err => {
            if (err) return res.status(400).json(err);
            res.sendStatus(204);
        }
    );
});

module.exports = router;
