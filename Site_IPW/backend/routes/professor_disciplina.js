const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /professor_disciplina/professor/:professor_id
// Retorna todas as disciplinas de um professor
router.get('/professor/:professor_id', (req, res) => {
    const query = `
        SELECT d.id, d.nome, d.curso_id, c.nome as curso_nome
        FROM disciplinas d
        INNER JOIN professor_disciplina pd ON d.id = pd.disciplina_id
        LEFT JOIN cursos c ON d.curso_id = c.id
        WHERE pd.professor_id = ?
    `;
    
    db.query(query, [req.params.professor_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao obter disciplinas do professor' });
        }
        res.json(result);
    });
});

// GET /professor_disciplina/disciplina/:disciplina_id
// Retorna todos os professores de uma disciplina
router.get('/disciplina/:disciplina_id', (req, res) => {
    const query = `
        SELECT p.id, p.nome, p.email
        FROM professores p
        INNER JOIN professor_disciplina pd ON p.id = pd.professor_id
        WHERE pd.disciplina_id = ?
    `;
    
    db.query(query, [req.params.disciplina_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao obter professores da disciplina' });
        }
        res.json(result);
    });
});

// POST /professor_disciplina
// Atribui uma disciplina a um professor
router.post('/', (req, res) => {
    const { professor_id, disciplina_id } = req.body;
    
    if (!professor_id || !disciplina_id) {
        return res.status(400).json({ error: 'Professor e disciplina são obrigatórios' });
    }
    
    db.query(
        'INSERT INTO professor_disciplina (professor_id, disciplina_id) VALUES (?, ?)',
        [professor_id, disciplina_id],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Professor já leciona esta disciplina' });
                }
                return res.status(500).json({ error: 'Erro ao atribuir disciplina' });
            }
            res.status(201).json({ id: result.insertId });
        }
    );
});

// DELETE /professor_disciplina/:professor_id/:disciplina_id
// Remove a atribuição de uma disciplina a um professor
router.delete('/:professor_id/:disciplina_id', (req, res) => {
    db.query(
        'DELETE FROM professor_disciplina WHERE professor_id = ? AND disciplina_id = ?',
        [req.params.professor_id, req.params.disciplina_id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao remover disciplina' });
            }
            res.sendStatus(204);
        }
    );
});

module.exports = router;