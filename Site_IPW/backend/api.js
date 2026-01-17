const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());


const cursosRoutes = require('./routes/cursos');
const alunosRoutes = require('./routes/alunos');
const professoresRoutes = require('./routes/professores');
const disciplinasRoutes = require('./routes/disciplinas');
const professorDisciplinaRoutes = require('./routes/professor_disciplina');
const cursoAlunoRoutes = require('./routes/curso_aluno');



app.use('/api/cursos', cursosRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/professores', professoresRoutes);
app.use('/api/disciplinas', disciplinasRoutes);
app.use('/api/professor_disciplina', professorDisciplinaRoutes);
app.use('/api/curso_aluno', cursoAlunoRoutes);

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

app.listen(3001, () => {
    console.log('API a correr em http://localhost:3001');
});