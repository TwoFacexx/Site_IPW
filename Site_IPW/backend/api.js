const express = require('express');
const cors = require('cors');

const cursosRoutes = require('./routes/cursos');
const alunosRoutes = require('./routes/alunos');
const professoresRoutes = require('./routes/professores');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/cursos', cursosRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/professores', professoresRoutes);

// Evitar pedidos de favicon e o erro 404 desaparecer do terminal do browser
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

app.listen(3000, () => {
    console.log('API a correr em http://localhost:3000');
});
