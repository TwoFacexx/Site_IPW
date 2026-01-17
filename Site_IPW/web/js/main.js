// CONFIG API
const API_URL = 'http://localhost:3000/api';

// ==========================================
// DASHBOARD / HOME
// ==========================================
async function loadDashboard() {
    try {
        const [cursos, alunos, professores] = await Promise.all([
            fetch(`${API_URL}/cursos`).then(r => r.json()),
            fetch(`${API_URL}/alunos`).then(r => r.json()),
            fetch(`${API_URL}/professores`).then(r => r.json())
        ]);

        // Atualizar stats
        document.getElementById('totalCursos').textContent = cursos.length;
        document.getElementById('totalAlunos').textContent = alunos.length;
        document.getElementById('totalProfessores').textContent = professores.length;

        // Mostrar cursos no dashboard
        const cursosGrid = document.getElementById('cursosGrid');
        if (cursos.length === 0) {
            cursosGrid.innerHTML = '<div class="empty-state"><h3>Nenhum curso disponível</h3><p>Adicione cursos na área de gestão</p></div>';
        } else {
            cursosGrid.innerHTML = cursos.map(curso => {
                const prof = professores.find(p => p.id === curso.professor_id);
                return `
                    <div class="card fade-in">
                        <h4>${curso.nome}</h4>
                        <p><strong>Professor:</strong> ${prof ? prof.nome : 'Não atribuído'}</p>
                        <p><strong>ID:</strong> ${curso.id}</p>
                    </div>
                `;
            }).join('');
        }

        // Mostrar últimos alunos
        const recentAlunos = document.getElementById('recentAlunos');
        if (recentAlunos) {
            const ultimosAlunos = alunos.slice(-5).reverse();
            if (ultimosAlunos.length === 0) {
                recentAlunos.innerHTML = '<div class="empty-state"><p>Nenhum aluno registado</p></div>';
            } else {
                recentAlunos.innerHTML = ultimosAlunos.map(aluno => `
                    <div class="list-item fade-in">
                        <div class="list-item-info">
                            <h4>${aluno.nome}</h4>
                            <p>${aluno.email}</p>
                        </div>
                        <span style="color: var(--gray); font-size: 12px;">ID: ${aluno.id}</span>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        showError('Erro ao carregar dados do dashboard');
    }
}

// ==========================================
// GESTÃO DE CURSOS
// ==========================================
let allCursos = [];
let allProfessores = [];

async function loadCursos() {
    try {
        const [cursos, professores] = await Promise.all([
            fetch(`${API_URL}/cursos`).then(r => r.json()),
            fetch(`${API_URL}/professores`).then(r => r.json())
        ]);

        allCursos = cursos;
        allProfessores = professores;

        const tbody = document.querySelector('#tabelaCursos tbody');
        if (cursos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum curso registado</td></tr>';
        } else {
            tbody.innerHTML = cursos.map(curso => {
                const prof = professores.find(p => p.id === curso.professor_id);
                return `
                    <tr class="fade-in">
                        <td>${curso.id}</td>
                        <td><strong>${curso.nome}</strong></td>
                        <td>${prof ? prof.nome : 'Não atribuído'}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editCurso(${curso.id})">✏️ Editar</button>
                            <button class="btn btn-danger" onclick="deleteCurso(${curso.id})">🗑️ Apagar</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('Erro ao carregar cursos:', err);
        showError('Erro ao carregar cursos');
    }
}

async function loadProfessoresSelect() {
    try {
        const professores = await fetch(`${API_URL}/professores`).then(r => r.json());
        const select = document.getElementById('cursoProfessor');
        if (select) {
            select.innerHTML = '<option value="">Selecione um professor</option>' +
                professores.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
        }
    } catch (err) {
        console.error('Erro ao carregar professores:', err);
    }
}

async function saveCurso(e) {
    e.preventDefault();
    
    const id = document.getElementById('cursoId').value;
    const nome = document.getElementById('cursoNome').value.trim();
    const professor_id = document.getElementById('cursoProfessor').value;

    if (!nome) {
        showError('Por favor, preencha o nome do curso');
        return;
    }
    if (!professor_id) {
        showError('Por favor, selecione um professor');
        return;
    }

    const url = id ? `${API_URL}/cursos/${id}` : `${API_URL}/cursos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, professor_id: parseInt(professor_id) })
        });

        if (response.ok) {
            showSuccess(id ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!');
            resetFormCurso();
            loadCursos();
        } else {
            throw new Error('Erro na resposta do servidor');
        }
    } catch (err) {
        console.error('Erro ao salvar curso:', err);
        showError('Erro ao salvar curso. Tente novamente.');
    }
}

function editCurso(id) {
    const curso = allCursos.find(c => c.id === id);
    if (!curso) return;

    document.getElementById('cursoId').value = curso.id;
    document.getElementById('cursoNome').value = curso.nome;
    document.getElementById('cursoProfessor').value = curso.professor_id;
    
    document.getElementById('formTitle').textContent = 'Editar Curso';
    document.getElementById('btnText').textContent = 'Atualizar Curso';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteCurso(id) {
    if (!confirm('Tem certeza que deseja apagar este curso?')) return;

    try {
        const response = await fetch(`${API_URL}/cursos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showSuccess('Curso apagado com sucesso!');
            loadCursos();
        } else {
            throw new Error('Erro ao apagar');
        }
    } catch (err) {
        console.error('Erro ao apagar curso:', err);
        showError('Erro ao apagar curso');
    }
}

function resetFormCurso() {
    document.getElementById('formCurso').reset();
    document.getElementById('cursoId').value = '';
    document.getElementById('formTitle').textContent = 'Adicionar Novo Curso';
    document.getElementById('btnText').textContent = 'Criar Curso';
}

// ==========================================
// GESTÃO DE ALUNOS
// ==========================================
let allAlunos = [];

async function loadAlunos() {
    try {
        const alunos = await fetch(`${API_URL}/alunos`).then(r => r.json());
        allAlunos = alunos;
        renderAlunos(alunos);
    } catch (err) {
        console.error('Erro ao carregar alunos:', err);
        showError('Erro ao carregar alunos');
    }
}

function renderAlunos(alunos) {
    const tbody = document.querySelector('#tabelaAlunos tbody');
    if (alunos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum aluno registado</td></tr>';
    } else {
        tbody.innerHTML = alunos.map(aluno => `
            <tr class="fade-in">
                <td>${aluno.id}</td>
                <td><strong>${aluno.nome}</strong></td>
                <td>${aluno.email}</td>
                <td>
                    <button class="btn btn-warning" onclick="editAluno(${aluno.id})">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="deleteAluno(${aluno.id})">🗑️ Apagar</button>
                </td>
            </tr>
        `).join('');
    }
}

async function saveAluno(e) {
    e.preventDefault();
    
    const id = document.getElementById('alunoId').value;
    const nome = document.getElementById('alunoNome').value.trim();
    const email = document.getElementById('alunoEmail').value.trim();

    if (!nome || !email) {
        showError('Por favor, preencha todos os campos');
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
            showSuccess(id ? 'Aluno atualizado com sucesso!' : 'Aluno criado com sucesso!');
            resetFormAluno();
            loadAlunos();
        } else {
            const errorData = await response.text();
            console.error('Erro do servidor:', errorData);
            throw new Error('Erro na resposta do servidor');
        }
    } catch (err) {
        console.error('Erro ao salvar aluno:', err);
        showError('Erro ao salvar aluno. Verifique o console para mais detalhes.');
    }
}

function editAluno(id) {
    const aluno = allAlunos.find(a => a.id === id);
    if (!aluno) return;

    document.getElementById('alunoId').value = aluno.id;
    document.getElementById('alunoNome').value = aluno.nome;
    document.getElementById('alunoEmail').value = aluno.email;
    
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

async function loadProfessores() {
    try {
        const [professores, cursos] = await Promise.all([
            fetch(`${API_URL}/professores`).then(r => r.json()),
            fetch(`${API_URL}/cursos`).then(r => r.json())
        ]);
        allProfessoresPage = professores;
        renderProfessores(professores, cursos);
    } catch (err) {
        console.error('Erro ao carregar professores:', err);
        showError('Erro ao carregar professores');
    }
}

function renderProfessores(professores, cursos = []) {
    const tbody = document.querySelector('#tabelaProfessores tbody');
    if (professores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum professor registado</td></tr>';
    } else {
        tbody.innerHTML = professores.map(prof => {
            const cursosDoProfessor = cursos.filter(c => c.professor_id === prof.id);
            const cursosNomes = cursosDoProfessor.length > 0 
                ? cursosDoProfessor.map(c => c.nome).join(', ')
                : 'Nenhum';
            
            return `
                <tr class="fade-in">
                    <td>${prof.id}</td>
                    <td><strong>${prof.nome}</strong></td>
                    <td>${prof.email}</td>
                    <td>${cursosNomes}</td>
                    <td>
                        <button class="btn btn-warning" onclick="editProfessor(${prof.id})">✏️ Editar</button>
                        <button class="btn btn-danger" onclick="deleteProfessor(${prof.id})">🗑️ Apagar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

async function saveProfessor(e) {
    e.preventDefault();
    
    const id = document.getElementById('professorId').value;
    const nome = document.getElementById('professorNome').value.trim();
    const email = document.getElementById('professorEmail').value.trim();

    if (!nome || !email) {
        showError('Por favor, preencha todos os campos');
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
            showSuccess(id ? 'Professor atualizado com sucesso!' : 'Professor criado com sucesso!');
            resetFormProfessor();
            loadProfessores();
        } else {
            const errorData = await response.text();
            console.error('Erro do servidor:', errorData);
            throw new Error('Erro na resposta do servidor');
        }
    } catch (err) {
        console.error('Erro ao salvar professor:', err);
        showError('Erro ao salvar professor. Verifique o console para mais detalhes.');
    }
}

function editProfessor(id) {
    const professor = allProfessoresPage.find(p => p.id === id);
    if (!professor) return;

    document.getElementById('professorId').value = professor.id;
    document.getElementById('professorNome').value = professor.nome;
    document.getElementById('professorEmail').value = professor.email;
    
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
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}