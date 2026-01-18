const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /cursos
// Devolve todos os cursos
router.get('/', (req, res) => {
    db.query('SELECT * FROM cursos', (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao obter cursos' });
        }
        res.json(result);
    });
});

// POST /cursos
// Cria um novo curso com validação do professor
router.post('/', (req, res) => {
    const { nome, professor_id } = req.body;

    if (!nome || !professor_id) {
        return res.status(400).json({
            error: 'Nome do curso e professor_id são obrigatórios'
        });
    }

    // Verificar se o professor existe
    db.query(
        'SELECT id FROM professores WHERE id = ?',
        [professor_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: 'Erro ao validar professor'
                });
            }

            if (result.length === 0) {
                return res.status(400).json({
                    error: 'Professor não existe'
                });
            }

            // Professor existe, criar curso
            db.query(
                'INSERT INTO cursos (nome, professor_id) VALUES (?, ?)',
                [nome, professor_id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            error: 'Erro ao criar curso'
                        });
                    }

                    res.status(201).json({
                        id: result.insertId
                    });
                }
            );
        }
    );
});

// PUT /cursos/:id
// Atualiza um curso existente com validação do professor
router.put('/:id', (req, res) => {
    const { nome, professor_id } = req.body;

    if (!nome || !professor_id) {
        return res.status(400).json({
            error: 'Nome do curso e professor_id são obrigatórios'
        });
    }

    // Verificar se o professor existe
    db.query(
        'SELECT id FROM professores WHERE id = ?',
        [professor_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: 'Erro ao validar professor'
                });
            }

            if (result.length === 0) {
                return res.status(400).json({
                    error: 'Professor não existe'
                });
            }

            // Professor existe, atualizar curso
            db.query(
                'UPDATE cursos SET nome = ?, professor_id = ? WHERE id = ?',
                [nome, professor_id, req.params.id],
                err => {
                    if (err) {
                        return res.status(500).json({
                            error: 'Erro ao atualizar curso'
                        });
                    }

                    res.sendStatus(204);
                }
            );
        }
    );
});

// DELETE /cursos/:id
// Remove um curso
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM cursos WHERE id = ?',
        [req.params.id],
        err => {
            if (err) {
                return res.status(500).json({
                    error: 'Erro ao remover curso'
                });
            }

            res.sendStatus(204);
        }
    );
});

module.exports = router;
