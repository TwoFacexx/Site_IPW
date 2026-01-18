// Importação do Express e criação do router
const express = require('express');
const router = express.Router();
//verificação regex email, verifica se tem a estrutura correta
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Importação da ligação à base de dados MySQL
const db = require('../db');

// GET /alunos
// Devolve a lista completa de alunos
router.get('/', (req, res) => {
    db.query('SELECT * FROM alunos', (err, result) => {
        if (err) {
            // Erro interno ao aceder à base de dados
            return res.status(500).json({
                error: 'Erro ao obter alunos'
            });
        }
        // REMOVIDO A VALIDAÇÃO DAQUI - não faz sentido validar email numa rota GET
        res.json(result);
    });
});

// POST /alunos
// Cria um novo aluno
router.post('/', (req, res) => {
    const { nome, email } = req.body;
    
    // Validação básica dos dados recebidos
    if (!nome || !email) {
        return res.status(400).json({
            error: 'Nome e email são obrigatórios'
        });
    }
    
    // VALIDAÇÃO DO EMAIL ADICIONADA AQUI
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Email inválido'
        });
    }
    
    db.query(
        'INSERT INTO alunos (nome, email) VALUES (?, ?)',
        [nome, email],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: 'Erro ao criar aluno'
                });
            }
            // Aluno criado com sucesso
            res.status(201).json({
                id: result.insertId
            });
        }
    );
});

// PUT /alunos/:id
// Atualiza os dados de um aluno existente
router.put('/:id', (req, res) => {
    const { nome, email } = req.body;
    
    // Validação básica dos dados
    if (!nome || !email) {
        return res.status(400).json({
            error: 'Nome e email são obrigatórios'
        });
    }
    
    // VALIDAÇÃO DO EMAIL MOVIDA PARA ANTES DO UPDATE
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Email inválido'
        });
    }
    
    db.query(
        'UPDATE alunos SET nome = ?, email = ? WHERE id = ?',
        [nome, email, req.params.id],
        err => {
            if (err) {
                return res.status(500).json({
                    error: 'Erro ao atualizar aluno'
                });
            }
            // Atualização bem-sucedida sem retorno de conteúdo
            res.sendStatus(204);
        }
    );
});

// DELETE /alunos/:id
// Remove um aluno da base de dados
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM alunos WHERE id = ?',
        [req.params.id],
        err => {
            if (err) {
                return res.status(500).json({
                    error: 'Erro ao remover aluno'
                });
            }
            // Remoção bem-sucedida
            res.sendStatus(204);
        }
    );
});

// Exportação do router
module.exports = router;