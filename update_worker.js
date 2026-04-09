import fs from 'fs';

let code = fs.readFileSync('src/worker.ts', 'utf-8');

const schemaSql = `
CREATE TABLE IF NOT EXISTS empresas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  cnpj TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  diretor TEXT,
  secretario TEXT,
  plano TEXT,
  logo_url TEXT
);
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  professor_id INTEGER,
  nome TEXT,
  email TEXT UNIQUE,
  senha TEXT,
  perfil TEXT,
  primeiro_acesso INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS cursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  nome TEXT,
  descricao TEXT,
  tipo TEXT DEFAULT 'regular'
);
CREATE TABLE IF NOT EXISTS disciplinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  curso_id INTEGER,
  nome TEXT,
  carga_horaria INTEGER,
  tipo_avaliacao TEXT DEFAULT 'nota'
);
CREATE TABLE IF NOT EXISTS turmas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  curso_id INTEGER,
  nome TEXT,
  turno TEXT,
  capacidade INTEGER,
  ano_letivo INTEGER
);
CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  turma_id INTEGER,
  nome TEXT,
  cpf TEXT,
  rg TEXT,
  data_nascimento TEXT,
  cidade_nascimento TEXT,
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  foto TEXT,
  nome_pai TEXT,
  nome_mae TEXT,
  responsavel_legal TEXT,
  telefone TEXT,
  email TEXT,
  problemas_saude TEXT,
  problemas_saude_outros TEXT,
  uso_medicamentos INTEGER DEFAULT 0,
  medicamentos_quais TEXT,
  status TEXT DEFAULT 'ativo'
);
CREATE TABLE IF NOT EXISTS funcionarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  nome TEXT,
  cpf TEXT,
  rg TEXT,
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  telefone TEXT,
  email TEXT,
  foto TEXT,
  cargo TEXT,
  data_admissao TEXT,
  status TEXT DEFAULT 'ativo'
);
CREATE TABLE IF NOT EXISTS permissoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  usuario_id INTEGER,
  tela TEXT,
  pode_acessar INTEGER DEFAULT 1,
  pode_editar INTEGER DEFAULT 0,
  pode_excluir INTEGER DEFAULT 0,
  pode_backup INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS professores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  nome TEXT,
  especialidade TEXT
);
CREATE TABLE IF NOT EXISTS matriculas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  turma_id INTEGER,
  data_matricula TEXT,
  status TEXT DEFAULT 'ativa'
);
CREATE TABLE IF NOT EXISTS notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  disciplina_id INTEGER,
  turma_id INTEGER,
  bimestre INTEGER,
  valor REAL,
  conceito TEXT,
  observacao TEXT
);
CREATE TABLE IF NOT EXISTS frequencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  disciplina_id INTEGER,
  turma_id INTEGER,
  data TEXT,
  status TEXT,
  justificativa TEXT
);
CREATE TABLE IF NOT EXISTS historico_remanejamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  turma_anterior_id INTEGER,
  turma_nova_id INTEGER,
  data_remanejamento TEXT,
  motivo TEXT
);
CREATE TABLE IF NOT EXISTS financeiro (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  descricao TEXT,
  valor REAL,
  vencimento TEXT,
  status TEXT,
  metodo_pagamento TEXT
);
CREATE TABLE IF NOT EXISTS comunicados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  titulo TEXT,
  conteudo TEXT,
  data_postagem TEXT,
  alvo TEXT
);
CREATE TABLE IF NOT EXISTS comunicados_lidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  comunicado_id INTEGER,
  aluno_id INTEGER,
  data_leitura TEXT
);
CREATE TABLE IF NOT EXISTS solicitacoes_documentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  tipo_documento TEXT,
  status TEXT DEFAULT 'pendente',
  data_solicitacao TEXT,
  observacao TEXT
);
`;

const newInitDbRoute = `app.post('/api/init-db', async (c) => {
  const db = new DBWrapper(c.env.DB);
  try {
    const schema = \`${schemaSql}\`;
    const queries = schema.split(';').map(q => q.trim()).filter(q => q.length > 0);
    
    for (const q of queries) {
      await db.exec(q);
    }

    // Seed initial data
    const empresaCount = await db.prepare("SELECT count(*) as count FROM empresas").get() as any;
    if (empresaCount.count === 0) {
      await db.prepare("INSERT INTO empresas (nome, cnpj, endereco, telefone, email, diretor, secretario, plano) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run("Escola EduManager", "00.000.000/0001-00", "Rua das Flores, 123 - Centro", "(11) 99999-9999", "contato@edumanager.com", "Dr. Roberto Silva", "Maria Oliveira", "Premium");
      
      const hash = bcrypt.hashSync('123', 10);
      await db.prepare("INSERT INTO usuarios (empresa_id, nome, email, senha, perfil) VALUES (?, ?, ?, ?, ?)").run(1, 'Admin', 'admin@admin.com', hash, 'admin');
      
      await db.prepare("INSERT INTO cursos (empresa_id, nome, descricao) VALUES (?, ?, ?)").run(1, 'Ensino Fundamental II', '6º ao 9º ano');
      await db.prepare("INSERT INTO disciplinas (empresa_id, curso_id, nome, carga_horaria) VALUES (?, ?, ?, ?)").run(1, 1, 'Matemática', 80);
      await db.prepare("INSERT INTO disciplinas (empresa_id, curso_id, nome, carga_horaria) VALUES (?, ?, ?, ?)").run(1, 1, 'Português', 80);
      await db.prepare("INSERT INTO turmas (empresa_id, curso_id, nome, turno, capacidade, ano_letivo) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, '6º Ano A', 'Manhã', 30, 2026);
      
      await db.prepare("INSERT INTO alunos (empresa_id, nome, cpf, status) VALUES (?, ?, ?, ?)").run(1, "João Silva", "123.456.789-00", 'ativo');
      await db.prepare("INSERT INTO usuarios (empresa_id, aluno_id, nome, email, senha, perfil) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'João Silva', 'aluno@aluno.com', hash, 'aluno');
      await db.prepare("INSERT INTO matriculas (empresa_id, aluno_id, turma_id, data_matricula) VALUES (?, ?, ?, ?)").run(1, 1, 1, '2026-01-15');
      
      await db.prepare("INSERT INTO financeiro (empresa_id, aluno_id, descricao, valor, vencimento, status) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'Mensalidade Março', 450.00, '2026-03-10', 'pendente');
      
      await db.prepare("INSERT INTO comunicados (empresa_id, titulo, conteudo, data_postagem, alvo) VALUES (?, ?, ?, ?, ?)").run(1, 'Início das Aulas', 'As aulas começam dia 10 de Fevereiro.', '2026-02-01', 'todos');
    }

    return c.json({ success: true, message: 'Banco de dados inicializado com sucesso!' });
  } catch (err: any) {
    console.error('Init DB Error:', err);
    return c.json({ error: err.message }, 500);
  }
});`;

// Replace the old route with the new one
const startMarker = "app.post('/api/init-db'";
const endMarker = "});";
const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newInitDbRoute + code.substring(endIndex + endMarker.length);
  fs.writeFileSync('src/worker.ts', code);
  console.log('Successfully updated init-db route');
} else {
  console.error('Could not find init-db route');
}
