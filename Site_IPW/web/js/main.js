// CONFIG API
const API_URL = 'http://localhost:3001/api';

// ==========================================
// DASHBOARD
// ==========================================
async function loadDashboard() {
    try {
        const [cursos, alunos, professores] = await Promise.all([
            fetch(`${API_URL}/cursos`).then(r => r.json()),
            fetch(`${API_URL}/alunos`).then(r => r.json()),
            fetch(`${API_URL}/professores`).then(r => r.json())
        ]);

        document.getElementById('totalCursos').textContent = cursos.length;
        document.getElementById('totalAlunos').textContent = alunos.length;
        document.getElementById('totalProfessores').textContent = professores.length;

        const cursosGrid = document.getElementById('cursosGrid');

        if (cursos.length === 0) {
            cursosGrid.innerHTML = '<div class="empty-state">Nenhum curso disponível</div>';
        } else {
            cursosGrid.innerHTML = cursos.map(curso => `
                <div class="card fade-in">
                    <h4>${curso.nome}</h4>
                    <p><strong>ID:</strong> ${curso.id}</p>
                </div>
            `).join('');
        }

        const recentAlunos = document.getElementById('recentAlunos');
        const ultimos = alunos.slice(-5).reverse();

        recentAlunos.innerHTML = ultimos.length === 0
            ? '<div class="empty-state">Nenhum aluno registado</div>'
            : ultimos.map(a => `
                <div class="list-item fade-in">
                    <div class="list-item-info">
                        <h4>${a.nome}</h4>
                        <p>${a.email}</p>
                    </div>
                </div>
            `).join('');

    } catch (err) {
        console.error(err);
        showError("Erro ao carregar dashboard");
    }
}

// ==========================================
// CURSOS
// ==========================================
let allCursos = [];

async function loadCursos() {
    try {
        const cursos = await fetch(`${API_URL}/cursos`).then(r => r.json());
        allCursos = cursos;
        renderCursos(cursos);
    } catch (err) {
        console.error(err);
        showError("Erro ao carregar cursos");
    }
}

function renderCursos(cursos) {
    const tbody = document.querySelector('#tabelaCursos tbody');
    if (cursos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Nenhum curso registado</td></tr>';
    } else {
        tbody.innerHTML = cursos.map(curso => `
            <tr class="fade-in">
                <td>${curso.id}</td>
                <td><strong>${curso.nome}</strong></td>
                <td>
                    <button class="btn btn-warning" onclick="editCurso(${curso.id})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteCurso(${curso.id})">Apagar</button>
                </td>
            </tr>
        `).join('');
    }
}

function searchCursos(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allCursos.filter(curso => 
        curso.nome.toLowerCase().includes(searchTerm)
    );
    renderCursos(filtered);
}

async function saveCurso(e) {
    e.preventDefault();

    const id = document.getElementById('cursoId').value;
    const nome = document.getElementById('cursoNome').value.trim();

    if (!nome) return showError("O nome do curso é obrigatório");

    const url = id ? `${API_URL}/cursos/${id}` : `${API_URL}/cursos`;
    const method = id ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome })
        });

        if (!res.ok) throw new Error("Falha");

        resetFormCurso();
        loadCursos();
    } catch (err) {
        showError("Erro ao salvar curso");
    }
}

function editCurso(id) {
    const curso = allCursos.find(c => c.id === id);
    if (!curso) return;

    document.getElementById('cursoId').value = curso.id;
    document.getElementById('cursoNome').value = curso.nome;

    document.getElementById('formTitle').textContent = "Editar Curso";
    document.getElementById('btnText').textContent = "Atualizar Curso";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteCurso(id) {
    if (!confirm("Deseja apagar este curso?")) return;

    await fetch(`${API_URL}/cursos/${id}`, { method: "DELETE" });
    loadCursos();
}

function resetFormCurso() {
    document.getElementById('formCurso').reset();
    document.getElementById('cursoId').value = "";
    document.getElementById('formTitle').textContent = "Adicionar Novo Curso";
    document.getElementById('btnText').textContent = "Criar Curso";
}

// ==========================================
// GESTÃO DE ALUNOS
// ==========================================
let allAlunos = [];
let allCursosForAlunos = [];

async function loadAlunos() {
    try {
        const alunosResponse = await fetch(`${API_URL}/alunos`);
        if (!alunosResponse.ok) {
            throw new Error(`Erro HTTP: ${alunosResponse.status}`);
        }
        const alunos = await alunosResponse.json();
        allAlunos = alunos;
        
        // Carregar cursos de cada aluno
        for (let aluno of alunos) {
            try {
                const cursosResponse = await fetch(`${API_URL}/curso_aluno/aluno/${aluno.id}`);
                if (cursosResponse.ok) {
                    aluno.cursos = await cursosResponse.json();
                } else {
                    aluno.cursos = [];
                }
            } catch (err) {
                console.warn(`Erro ao carregar cursos do aluno ${aluno.id}:`, err);
                aluno.cursos = [];
            }
        }
        
        renderAlunos(alunos);
    } catch (err) {
        console.error('Erro ao carregar alunos:', err);
        showError('Erro ao carregar alunos: ' + err.message);
    }
}

function renderAlunos(alunos) {
    const tbody = document.querySelector('#tabelaAlunos tbody');
    if (alunos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum aluno registado</td></tr>';
    } else {
        tbody.innerHTML = alunos.map(aluno => {
            const cursosTexto = aluno.cursos && aluno.cursos.length > 0 
                ? aluno.cursos.map(c => c.nome).join(', ') 
                : '<em style="color: #999;">Sem cursos</em>';
            
            return `
                <tr class="fade-in">
                    <td>${aluno.id}</td>
                    <td><strong>${aluno.nome}</strong></td>
                    <td>${aluno.email}</td>
                    <td>${cursosTexto}</td>
                    <td>
                        <button class="btn btn-warning" onclick="editAluno(${aluno.id})">Editar</button>
                        <button class="btn btn-danger" onclick="deleteAluno(${aluno.id})">Apagar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

async function loadCursosSelectAlunos() {
    try {
        const cursos = await fetch(`${API_URL}/cursos`).then(r => r.json());
        allCursosForAlunos = cursos;
        
        const select = document.getElementById('alunoCursos');
        select.innerHTML = cursos.map(c => 
            `<option value="${c.id}">${c.nome}</option>`
        ).join('');
    } catch (err) {
        console.error('Erro ao carregar cursos:', err);
    }
}

async function saveAluno(e) {
    e.preventDefault();
    
    const id = document.getElementById('alunoId').value;
    const nome = document.getElementById('alunoNome').value.trim();
    const email = document.getElementById('alunoEmail').value.trim();
    const cursosSelect = document.getElementById('alunoCursos');
    const cursosSelecionados = Array.from(cursosSelect.selectedOptions).map(opt => opt.value);

    if (!nome || !email) {
        showError('Por favor, preencha todos os campos');
        return;
    }

    if (cursosSelecionados.length === 0) {
        showError('Por favor, selecione pelo menos um curso');
        return;
    }

    const url = id ? `${API_URL}/alunos/${id}` : `${API_URL}/alunos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email })
        });

        if (response.ok || response.status === 204 || response.status === 201) {
            let alunoId = id;
            
            // Se está criando, pegar o ID retornado
            if (!id && response.status === 201) {
                const data = await response.json();
                alunoId = data.id;
            }
            
            // Se está editando, remover cursos antigos
            if (id) {
                try {
                    const cursosResponse = await fetch(`${API_URL}/curso_aluno/aluno/${id}`);
                    if (cursosResponse.ok) {
                        const cursosAntigos = await cursosResponse.json();
                        for (let curso of cursosAntigos) {
                            await fetch(`${API_URL}/curso_aluno/${id}/${curso.id}`, { method: 'DELETE' });
                        }
                    }
                } catch (err) {
                    console.warn('Erro ao remover cursos antigos:', err);
                }
            }
            
            // Adicionar novos cursos
            for (let cursoId of cursosSelecionados) {
                try {
                    await fetch(`${API_URL}/curso_aluno`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ aluno_id: alunoId, curso_id: cursoId })
                    });
                } catch (err) {
                    console.warn(`Erro ao adicionar curso ${cursoId}:`, err);
                }
            }
            
            showSuccess(id ? 'Aluno atualizado!' : 'Aluno criado!');
            resetFormAluno();
            loadAlunos();
        } else {
            throw new Error('Erro na resposta do servidor');
        }
    } catch (err) {
        console.error('Erro ao salvar aluno:', err);
        showError('Erro ao salvar aluno: ' + err.message);
    }
}

async function editAluno(id) {
    const aluno = allAlunos.find(a => a.id === id);
    if (!aluno) return;

    document.getElementById('alunoId').value = aluno.id;
    document.getElementById('alunoNome').value = aluno.nome;
    document.getElementById('alunoEmail').value = aluno.email;
    
    // Selecionar cursos do aluno
    try {
        const cursosResponse = await fetch(`${API_URL}/curso_aluno/aluno/${id}`);
        if (cursosResponse.ok) {
            const cursosAluno = await cursosResponse.json();
            const select = document.getElementById('alunoCursos');
            
            Array.from(select.options).forEach(opt => {
                opt.selected = cursosAluno.some(c => c.id == opt.value);
            });
        }
    } catch (err) {
        console.warn('Erro ao carregar cursos do aluno:', err);
    }
    
    document.getElementById('formTitle').textContent = 'Editar Aluno';
    document.getElementById('btnText').textContent = 'Atualizar Aluno';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteAluno(id) {
    if (!confirm('Tem certeza que deseja apagar este aluno?')) return;

    try {
        const response = await fetch(`${API_URL}/alunos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showSuccess('Aluno apagado com sucesso!');
            loadAlunos();
        } else {
            throw new Error('Erro ao apagar');
        }
    } catch (err) {
        console.error('Erro ao apagar aluno:', err);
        showError('Erro ao apagar aluno');
    }
}

function resetFormAluno() {
    document.getElementById('formAluno').reset();
    document.getElementById('alunoId').value = '';
    document.getElementById('formTitle').textContent = 'Adicionar Novo Aluno';
    document.getElementById('btnText').textContent = 'Criar Aluno';
    
    const select = document.getElementById('alunoCursos');
    Array.from(select.options).forEach(opt => opt.selected = false);
}

function searchAlunos(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allAlunos.filter(aluno => 
        aluno.nome.toLowerCase().includes(searchTerm) ||
        aluno.email.toLowerCase().includes(searchTerm)
    );
    renderAlunos(filtered);
}

// ==========================================
// GESTÃO DE PROFESSORES
// ==========================================
let allProfessoresPage = [];
let allDisciplinasForProfessores = [];

async function loadProfessores() {
    try {
        const professoresResponse = await fetch(`${API_URL}/professores`);
        if (!professoresResponse.ok) {
            throw new Error(`Erro HTTP: ${professoresResponse.status}`);
        }
        const professores = await professoresResponse.json();
        allProfessoresPage = professores;
        
        // Carregar disciplinas de cada professor
        for (let prof of professores) {
            try {
                const disciplinasResponse = await fetch(`${API_URL}/professor_disciplina/professor/${prof.id}`);
                if (disciplinasResponse.ok) {
                    prof.disciplinas = await disciplinasResponse.json();
                } else {
                    prof.disciplinas = [];
                }
            } catch (err) {
                console.warn(`Erro ao carregar disciplinas do professor ${prof.id}:`, err);
                prof.disciplinas = [];
            }
        }
        
        renderProfessores(professores);
    } catch (err) {
        console.error('Erro ao carregar professores:', err);
        showError('Erro ao carregar professores: ' + err.message);
    }
}

function renderProfessores(professores) {
    const tbody = document.querySelector('#tabelaProfessores tbody');

    tbody.innerHTML = professores.length === 0
        ? '<tr><td colspan="5" class="empty-state">Nenhum professor registado</td></tr>'
        : professores.map(prof => {
            const disciplinasTexto = prof.disciplinas && prof.disciplinas.length > 0
                ? prof.disciplinas.map(d => d.nome).join(', ')
                : '<em style="color: #999;">Sem disciplinas</em>';
            
            return `
                <tr class="fade-in">
                    <td>${prof.id}</td>
                    <td><strong>${prof.nome}</strong></td>
                    <td>${prof.email}</td>
                    <td>${disciplinasTexto}</td>
                    <td>
                        <button class="btn btn-warning" onclick="editProfessor(${prof.id})">Editar</button>
                        <button class="btn btn-danger" onclick="deleteProfessor(${prof.id})">Apagar</button>
                    </td>
                </tr>
            `;
        }).join('');
}

async function loadDisciplinasSelectProfessores() {
    try {
        console.log(' Carregando disciplinas...');
        const disciplinas = await fetch(`${API_URL}/disciplinas`).then(r => r.json());
        console.log(' Disciplinas carregadas:', disciplinas);
        
        allDisciplinasForProfessores = disciplinas;
        
        const select = document.getElementById('professorDisciplinas');
        console.log('Select encontrado:', select);
        
        if (!select) {
            console.error(' Select não encontrado!');
            return;
        }
        
        select.innerHTML = disciplinas.map(d => 
            `<option value="${d.id}">${d.nome}</option>`
        ).join('');
        
        console.log(' Disciplinas adicionadas ao select:', select.options.length);
    } catch (err) {
        console.error(' Erro ao carregar disciplinas:', err);
    }
}

async function saveProfessor(e) {
    e.preventDefault();
    
    const id = document.getElementById('professorId').value;
    const nome = document.getElementById('professorNome').value.trim();
    const email = document.getElementById('professorEmail').value.trim();
    const disciplinasSelect = document.getElementById('professorDisciplinas');
    
    if (!nome || !email) {
        showError('Por favor, preencha todos os campos');
        return;
    }


    if (!disciplinasSelect) {
        showError('Erro: Campo de disciplinas não encontrado. Recarregue a página.');
        return;
    }

    const disciplinasSelecionadas = Array.from(disciplinasSelect.selectedOptions).map(opt => opt.value);

    if (disciplinasSelecionadas.length === 0) {
        showError('Por favor, selecione pelo menos uma disciplina');
        return;
    }

    const url = id ? `${API_URL}/professores/${id}` : `${API_URL}/professores`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email })
        });

        if (response.ok || response.status === 204 || response.status === 201) {
            let professorId = id;
            
            // Se está criando, pegar o ID retornado
            if (!id && response.status === 201) {
                const data = await response.json();
                professorId = data.id;
            }
            
            // Se está editando, remover disciplinas antigas
            if (id) {
                try {
                    const disciplinasResponse = await fetch(`${API_URL}/professor_disciplina/professor/${id}`); 
                    if (disciplinasResponse.ok) {
                        const disciplinasAntigas = await disciplinasResponse.json();
                        for (let disc of disciplinasAntigas) {
                            await fetch(`${API_URL}/professor_disciplina/${id}/${disc.id}`, { method: 'DELETE' });  
                        }
                    }
                } catch (err) {
                    console.warn('Erro ao remover disciplinas antigas:', err);
                }
            }
            
            // Adicionar novas disciplinas
            for (let discId of disciplinasSelecionadas) {
                try {
                    await fetch(`${API_URL}/professor_disciplina`, {  
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ professor_id: professorId, disciplina_id: discId })
                    });
                } catch (err) {
                    console.warn(`Erro ao adicionar disciplina ${discId}:`, err);  
                }
            }
            
            showSuccess(id ? 'Professor atualizado!' : 'Professor criado!');
            resetFormProfessor();
            loadProfessores();
        } else {
            throw new Error('Erro na resposta do servidor');
        }
    } catch (err) {
        console.error('Erro ao salvar professor:', err);
        showError('Erro ao salvar professor: ' + err.message);
    }
}

async function editProfessor(id) {
    const professor = allProfessoresPage.find(p => p.id === id);
    if (!professor) return;

    document.getElementById('professorId').value = professor.id;
    document.getElementById('professorNome').value = professor.nome;
    document.getElementById('professorEmail').value = professor.email;
    
    // Selecionar disciplinas do professor
    try {
        const disciplinasResponse = await fetch(`${API_URL}/professor_disciplina/professor/${id}`);
        if (disciplinasResponse.ok) {
            const disciplinasProf = await disciplinasResponse.json();
            const select = document.getElementById('professorDisciplinas');
            
            Array.from(select.options).forEach(opt => {
                opt.selected = disciplinasProf.some(d => d.id == opt.value);
            });
        }
    } catch (err) {
        console.warn('Erro ao carregar disciplinas do professor:', err);
    }
    
    document.getElementById('formTitle').textContent = 'Editar Professor';
    document.getElementById('btnText').textContent = 'Atualizar Professor';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProfessor(id) {
    if (!confirm('Tem certeza que deseja apagar este professor?')) return;

    try {
        const response = await fetch(`${API_URL}/professores/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showSuccess('Professor apagado com sucesso!');
            loadProfessores();
        } else {
            throw new Error('Erro ao apagar');
        }
    } catch (err) {
        console.error('Erro ao apagar professor:', err);
        showError('Erro ao apagar professor');
    }
}

function resetFormProfessor() {
    document.getElementById('formProfessor').reset();
    document.getElementById('professorId').value = '';
    document.getElementById('formTitle').textContent = 'Adicionar Novo Professor';
    document.getElementById('btnText').textContent = 'Criar Professor';
    
    const select = document.getElementById('professorDisciplinas');
    Array.from(select.options).forEach(opt => opt.selected = false);
}

function searchProfessores(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allProfessoresPage.filter(prof => 
        prof.nome.toLowerCase().includes(searchTerm) ||
        prof.email.toLowerCase().includes(searchTerm)
    );
    renderProfessores(filtered);
}

// ==========================================
// UTILIDADES
// ==========================================
function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert(message);
}

// ==========================================
// GESTÃO DE DISCIPLINAS
// ==========================================
let allDisciplinas = [];
let allCursosForDisciplinas = [];

async function loadDisciplinas() {
    try {
        const disciplinas = await fetch(`${API_URL}/disciplinas`).then(r => r.json());
        const cursos = await fetch(`${API_URL}/cursos`).then(r => r.json());

        allDisciplinas = disciplinas;
        allCursosForDisciplinas = cursos;
        renderDisciplinas(disciplinas, cursos);
    } catch (err) {
        console.error("Erro ao carregar disciplinas", err);
        showError("Erro ao carregar disciplinas.");
    }
}

function renderDisciplinas(disciplinas, cursos) {
    const tbody = document.querySelector('#tabelaDisciplinas tbody');
    if (disciplinas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhuma disciplina registada</td></tr>';
    } else {
        tbody.innerHTML = disciplinas.map(d => {
            const curso = cursos.find(c => c.id === d.curso_id);
            return `
                <tr class="fade-in">
                    <td>${d.id}</td>
                    <td><strong>${d.nome}</strong></td>
                    <td>${curso ? curso.nome : 'Curso não encontrado'}</td>
                    <td>
                        <button class="btn btn-warning" onclick="editDisciplina(${d.id})">Editar</button>
                        <button class="btn btn-danger" onclick="deleteDisciplina(${d.id})">Apagar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

function searchDisciplinas(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allDisciplinas.filter(disc => 
        disc.nome.toLowerCase().includes(searchTerm)
    );
    renderDisciplinas(filtered, allCursosForDisciplinas);
}

async function loadCursosSelect_Disciplinas() {
    try {
        const cursos = await fetch(`${API_URL}/cursos`).then(r => r.json());
        const select = document.getElementById('disciplinaCurso');

        select.innerHTML = '<option value="">Selecione um curso</option>' +
            cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

    } catch (err) {
        console.error("Erro ao carregar cursos", err);
    }
}

async function saveDisciplina(e) {
    e.preventDefault();

    const id = document.getElementById('disciplinaId').value;
    const nome = document.getElementById('disciplinaNome').value.trim();
    const curso_id = document.getElementById('disciplinaCurso').value;

    if (!nome || !curso_id) {
        return showError("Preencha todos os campos.");
    }

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/disciplinas/${id}` : `${API_URL}/disciplinas`;

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, curso_id })
        });

        if (!res.ok) throw new Error();

        resetFormDisciplina();
        loadDisciplinas();

    } catch (err) {
        showError("Erro ao salvar disciplina.");
    }
}

function editDisciplina(id) {
    const disc = allDisciplinas.find(d => d.id === id);
    if (!disc) return;

    document.getElementById('disciplinaId').value = disc.id;
    document.getElementById('disciplinaNome').value = disc.nome;
    document.getElementById('disciplinaCurso').value = disc.curso_id;

    document.getElementById('formTitle').textContent = "Editar Disciplina";
    document.getElementById('btnText').textContent = "Atualizar Disciplina";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteDisciplina(id) {
    if (!confirm("Deseja apagar esta disciplina?")) return;

    try {
        await fetch(`${API_URL}/disciplinas/${id}`, { method: "DELETE" });
        loadDisciplinas();
    } catch {
        showError("Erro ao apagar disciplina.");
    }
}

function resetFormDisciplina() {
    document.getElementById('formDisciplina').reset();
    document.getElementById('disciplinaId').value = "";

    document.getElementById('formTitle').textContent = "Adicionar Nova Disciplina";
    document.getElementById('btnText').textContent = "Criar Disciplina";
}