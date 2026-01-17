// Importação do Express e criação do router
const express = require('express');
const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Importação da ligação à base de dados MySQL
const db = require('../db');

// GET /professores
// Devolve a lista completa de professores
router.get('/', (req, res) => {
    db.query('SELECT * FROM professores', (err, result) => {
        if (err) {
            // Erro interno do servidor ao aceder à base de dados
            return res.status(500).json({ error: 'Erro ao obter professores' });
        }
        res.json(result);
    });
});

// POST /professores
// Cria um novo professor
router.post('/', (req, res) => {
    const { nome, email } = req.body;

    // Validação básica dos dados recebidos
    if (!emailRegex.test(email)) {
    return res.status(400).json({
        error: 'Email inválido'
    });
}

    db.query(
        'INSERT INTO professores (nome, email) VALUES (?, ?)',
        [nome, email],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: 'Erro ao criar professor'
                });
            }

            // Professor criado com sucesso
            res.status(201).json({ id: result.insertId });
        }
    );
});

// PUT /professores/:id
// Atualiza os dados de um professor existente
router.put('/:id', (req, res) => {
    const { nome, email } = req.body;

    db.query(
        'UPDATE professores SET nome = ?, email = ? WHERE id = ?',
        [nome, email, req.params.id],
        err => {
            if (err) {
                return res.status(400).json({
                    error: 'Erro ao atualizar professor'
                });
            }
            if (!emailRegex.test(email)) {
    return res.status(400).json({
        error: 'Email inválido'
    });
}
            // Atualização bem-sucedida sem conteúdo de retorno
            res.sendStatus(204);
        }
    );
});

// DELETE /professores/:id
// Remove um professor da base de dados
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM professores WHERE id = ?',
        [req.params.id],
        err => {
            if (err) {
                return res.status(400).json({
                    error: 'Erro ao remover professor'
                });
            }

            // Remoção bem-sucedida
            res.sendStatus(204);
        }
    );
});

// Exportação do router para utilização no app principal
module.exports = router;
