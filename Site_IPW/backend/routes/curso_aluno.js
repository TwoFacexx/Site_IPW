const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /curso_aluno/aluno/:aluno_id
// Retorna todos os cursos de um aluno
router.get('/aluno/:aluno_id', (req, res) => {
    const query = `
        SELECT c.id, c.nome
        FROM cursos c
        INNER JOIN curso_aluno ca ON c.id = ca.curso_id
        WHERE ca.aluno_id = ?
    `;
    
    db.query(query, [req.params.aluno_id], (err, result) => {
        if (err) {
            console.error('Erro ao obter cursos do aluno:', err);
            return res.status(500).json({ error: 'Erro ao obter cursos do aluno' });
        }
        res.json(result);
    });
});

// GET /curso_aluno/curso/:curso_id
// Retorna todos os alunos de um curso
router.get('/curso/:curso_id', (req, res) => {
    const query = `
        SELECT a.id, a.nome, a.email
        FROM alunos a
        INNER JOIN curso_aluno ca ON a.id = ca.aluno_id
        WHERE ca.curso_id = ?
    `;
    
    db.query(query, [req.params.curso_id], (err, result) => {
        if (err) {
            console.error('Erro ao obter alunos do curso:', err);
            return res.status(500).json({ error: 'Erro ao obter alunos do curso' });
        }
        res.json(result);
    });
});

// POST /curso_aluno
// Matricula um aluno em um curso
router.post('/', (req, res) => {
    const { aluno_id, curso_id } = req.body;
    
    if (!aluno_id || !curso_id) {
        return res.status(400).json({ error: 'Aluno e curso são obrigatórios' });
    }
    
    db.query(
        'INSERT INTO curso_aluno (aluno_id, curso_id) VALUES (?, ?)',
        [aluno_id, curso_id],
        (err, result) => {
            if (err) {
                console.error('Erro ao matricular aluno:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Aluno já está matriculado neste curso' });
                }
                return res.status(500).json({ error: 'Erro ao matricular aluno' });
            }
            res.status(201).json({ id: result.insertId });
        }
    );
});

// DELETE /curso_aluno/:aluno_id/:curso_id
// Remove matrícula de um aluno em um curso
router.delete('/:aluno_id/:curso_id', (req, res) => {
    db.query(
        'DELETE FROM curso_aluno WHERE aluno_id = ? AND curso_id = ?',
        [req.params.aluno_id, req.params.curso_id],
        (err) => {
            if (err) {
                console.error('Erro ao remover matrícula:', err);
                return res.status(500).json({ error: 'Erro ao remover matrícula' });
            }
            res.sendStatus(204);
        }
    );
});

module.exports = router;