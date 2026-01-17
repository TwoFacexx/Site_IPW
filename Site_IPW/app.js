const express = require('express');
const path = require('path');
const app = express();

// IMPORTANTE: Serve ficheiros estáticos da pasta 'web'
app.use(express.static(path.join(__dirname, 'web')));

// Rota principal - serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/html/index.html'));
});

// Rotas para as outras páginas
app.get('/cursos', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/html/cursos.html'));
});

app.get('/alunos', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/html/alunos.html'));
});

app.get('/professores', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/html/professores.html'));
});

// Favicon
app.get('/favicon.ico', (req, res) => {
    res.sendStatus(204);
});

// 404
app.use((req, res) => {
    res.status(404).send('Página não encontrada');
});

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Frontend a correr em http://localhost:${PORT}`);
});