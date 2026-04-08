import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = 'SECRET_KEY_EDU_MANAGER';

async function startServer() {
  try {
    console.log('--- SERVER STARTING ---');
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Rota para download do banco de dados
    app.get('/api/download-db', (req, res) => {
      const dbPath = path.join(__dirname, 'database.db');
      res.download(dbPath, 'database.db');
    });

    // Database Initialization
    console.log('Iniciando banco de dados com better-sqlite3...');
    const db = new Database('./database.db');
    console.log('Banco de dados conectado.');

    db.exec(`
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
        tipo TEXT DEFAULT 'regular' -- 'regular' ou 'infantil'
      );

      CREATE TABLE IF NOT EXISTS disciplinas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa_id INTEGER,
        curso_id INTEGER,
        nome TEXT,
        carga_horaria INTEGER,
        tipo_avaliacao TEXT DEFAULT 'nota' -- 'nota', 'conceito', 'descritivo'
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
        problemas_saude TEXT, -- JSON array of strings
        problemas_saude_outros TEXT,
        uso_medicamentos INTEGER DEFAULT 0, -- 0 ou 1
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
        status TEXT, -- 'P' (Presente), 'F' (Falta), 'FJ' (Falta Justificada)
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
    `);

    // Migrations
    try {
      db.prepare("ALTER TABLE cursos ADD COLUMN tipo TEXT DEFAULT 'regular'").run();
      console.log('Migração: Coluna tipo adicionada à tabela cursos.');
    } catch (e) {}

    try {
      db.prepare("ALTER TABLE disciplinas ADD COLUMN tipo_avaliacao TEXT DEFAULT 'nota'").run();
      console.log('Migração: Coluna tipo_avaliacao adicionada à tabela disciplinas.');
    } catch (e) {}

    try {
      db.prepare("ALTER TABLE notas ADD COLUMN conceito TEXT").run();
      db.prepare("ALTER TABLE notas ADD COLUMN observacao TEXT").run();
      console.log('Migração: Colunas conceito e observacao adicionadas à tabela notas.');
    } catch (e) {}

    try {
      db.prepare("ALTER TABLE alunos ADD COLUMN turma_id INTEGER").run();
      console.log('Migração: Coluna turma_id adicionada à tabela alunos.');
    } catch (e) {}

    try {
      db.prepare("ALTER TABLE frequencias ADD COLUMN status TEXT").run();
      db.prepare("UPDATE frequencias SET status = CASE WHEN presente = 1 THEN 'P' ELSE 'F' END").run();
      console.log('Migração: Coluna status adicionada à tabela frequencias.');
    } catch (e) {}

    try {
      db.prepare("ALTER TABLE usuarios ADD COLUMN primeiro_acesso INTEGER DEFAULT 1").run();
      console.log('Migração: Coluna primeiro_acesso adicionada à tabela usuarios.');
    } catch (e) {}

    try {
      db.prepare("ALTER TABLE permissoes ADD COLUMN pode_editar INTEGER DEFAULT 0").run();
      db.prepare("ALTER TABLE permissoes ADD COLUMN pode_excluir INTEGER DEFAULT 0").run();
      db.prepare("ALTER TABLE permissoes ADD COLUMN pode_backup INTEGER DEFAULT 0").run();
      console.log('Migração: Colunas de permissões detalhadas adicionadas.');
    } catch (e) {}

    try {
      db.prepare("ALTER TABLE empresas ADD COLUMN cnpj TEXT").run();
      db.prepare("ALTER TABLE empresas ADD COLUMN endereco TEXT").run();
      db.prepare("ALTER TABLE empresas ADD COLUMN telefone TEXT").run();
      db.prepare("ALTER TABLE empresas ADD COLUMN email TEXT").run();
      db.prepare("ALTER TABLE empresas ADD COLUMN diretor TEXT").run();
      db.prepare("ALTER TABLE empresas ADD COLUMN secretario TEXT").run();
    } catch (e) {}

    try {
      db.prepare("ALTER TABLE alunos ADD COLUMN problemas_saude_outros TEXT").run();
      db.prepare("ALTER TABLE alunos ADD COLUMN uso_medicamentos INTEGER DEFAULT 0").run();
      db.prepare("ALTER TABLE alunos ADD COLUMN medicamentos_quais TEXT").run();
      console.log('Migração: Colunas de saúde adicionadas à tabela alunos.');
    } catch (e) {}

    // Seed initial data
    const empresaCount = db.prepare("SELECT count(*) as count FROM empresas").get() as any;
    if (empresaCount.count === 0) {
      db.prepare("INSERT INTO empresas (nome, cnpj, endereco, telefone, email, diretor, secretario, plano) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run("Escola EduManager", "00.000.000/0001-00", "Rua das Flores, 123 - Centro", "(11) 99999-9999", "contato@edumanager.com", "Dr. Roberto Silva", "Maria Oliveira", "Premium");
      const hash = bcrypt.hashSync('123', 10);
      db.prepare("INSERT INTO usuarios (empresa_id, nome, email, senha, perfil) VALUES (?, ?, ?, ?, ?)").run(1, 'Admin', 'admin@admin.com', hash, 'admin');
      
      // Academic Seed
      db.prepare("INSERT INTO cursos (empresa_id, nome, descricao) VALUES (?, ?, ?)").run(1, 'Ensino Fundamental II', '6º ao 9º ano');
      db.prepare("INSERT INTO disciplinas (empresa_id, curso_id, nome, carga_horaria) VALUES (?, ?, ?, ?)").run(1, 1, 'Matemática', 80);
      db.prepare("INSERT INTO disciplinas (empresa_id, curso_id, nome, carga_horaria) VALUES (?, ?, ?, ?)").run(1, 1, 'Português', 80);
      db.prepare("INSERT INTO turmas (empresa_id, curso_id, nome, turno, capacidade, ano_letivo) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, '6º Ano A', 'Manhã', 30, 2026);
      
      // Student Seed
      db.prepare("INSERT INTO alunos (empresa_id, nome, cpf, status) VALUES (?, ?, ?, ?)").run(1, "João Silva", "123.456.789-00", 'ativo');
      db.prepare("INSERT INTO usuarios (empresa_id, aluno_id, nome, email, senha, perfil) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'João Silva', 'aluno@aluno.com', hash, 'aluno');
      db.prepare("INSERT INTO matriculas (empresa_id, aluno_id, turma_id, data_matricula) VALUES (?, ?, ?, ?)").run(1, 1, 1, '2026-01-15');
      
      // Finance Seed
      db.prepare("INSERT INTO financeiro (empresa_id, aluno_id, descricao, valor, vencimento, status) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'Mensalidade Março', 450.00, '2026-03-10', 'pendente');
      
      // Communication Seed
      db.prepare("INSERT INTO comunicados (empresa_id, titulo, conteudo, data_postagem, alvo) VALUES (?, ?, ?, ?, ?)").run(1, 'Início das Aulas', 'As aulas começam dia 10 de Fevereiro.', '2026-02-01', 'todos');
      
      console.log('Dados iniciais profissionais semeados.');
    }

    // Auth Middleware
    const auth = (req: any, res: any, next: any) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Não autorizado' });

      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        req.user = decoded;
        next();
      });
    };

    // API Routes
    app.post('/api/login', (req, res) => {
      const { email, senha } = req.body;
      const user = db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email) as any;
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      const ok = bcrypt.compareSync(senha, user.senha);
      if (!ok) return res.status(401).json({ error: 'Senha incorreta' });
      
      const token = jwt.sign({ 
        id: user.id, 
        empresa_id: user.empresa_id, 
        aluno_id: user.aluno_id,
        professor_id: user.professor_id,
        nome: user.nome, 
        perfil: user.perfil 
      }, JWT_SECRET);
      
      res.json({ 
        token, 
        user: { 
          id: user.id,
          nome: user.nome, 
          email: user.email, 
          perfil: user.perfil, 
          aluno_id: user.aluno_id, 
          professor_id: user.professor_id,
          primeiro_acesso: user.primeiro_acesso === 1
        } 
      });
    });

    app.post('/api/change-password', auth, (req: any, res) => {
      const { novaSenha } = req.body;
      const hash = bcrypt.hashSync(novaSenha, 10);
      db.prepare("UPDATE usuarios SET senha = ?, primeiro_acesso = 0 WHERE id = ?").run(hash, req.user.id);
      res.json({ success: true });
    });

    app.post('/api/usuarios/reset-password', auth, (req: any, res) => {
      if (req.user.perfil !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
      const { usuario_id, nova_senha } = req.body;
      const hash = bcrypt.hashSync(nova_senha, 10);
      db.prepare("UPDATE usuarios SET senha = ?, primeiro_acesso = 1 WHERE id = ?").run(hash, usuario_id);
      res.json({ success: true });
    });

    app.post('/api/usuarios/criar', auth, (req: any, res) => {
      if (req.user.perfil !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
      const { nome, email, senha, perfil, aluno_id, professor_id } = req.body;
      const hash = bcrypt.hashSync(senha, 10);
      try {
        const result = db.prepare(`
          INSERT INTO usuarios (empresa_id, nome, email, senha, perfil, aluno_id, professor_id, primeiro_acesso)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `).run(req.user.empresa_id, nome, email, hash, perfil, aluno_id, professor_id);
        res.json({ id: result.lastInsertRowid });
      } catch (err: any) {
        res.status(400).json({ error: 'E-mail já cadastrado ou erro no banco' });
      }
    });

    app.get('/api/empresa', auth, (req: any, res) => {
      const row = db.prepare("SELECT * FROM empresas WHERE id = ?").get(req.user.empresa_id);
      res.json(row);
    });

    app.post('/api/empresa', auth, (req: any, res) => {
      const { nome, cnpj, endereco, telefone, email, diretor, secretario } = req.body;
      db.prepare("UPDATE empresas SET nome = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, diretor = ?, secretario = ? WHERE id = ?")
        .run(nome, cnpj, endereco, telefone, email, diretor, secretario, req.user.empresa_id);
      res.json({ success: true });
    });

    // Academic Endpoints
    app.get('/api/cursos', auth, (req: any, res) => {
      const rows = db.prepare("SELECT * FROM cursos WHERE empresa_id = ?").all(req.user.empresa_id);
      res.json(rows);
    });

    app.get('/api/disciplinas', auth, (req: any, res) => {
      const rows = db.prepare("SELECT * FROM disciplinas WHERE empresa_id = ?").all(req.user.empresa_id);
      res.json(rows);
    });

    app.get('/api/turmas', auth, (req: any, res) => {
      const rows = db.prepare(`
        SELECT t.*, c.nome as curso_nome 
        FROM turmas t 
        JOIN cursos c ON t.curso_id = c.id 
        WHERE t.empresa_id = ?`).all(req.user.empresa_id);
      res.json(rows);
    });

    // Student Endpoints
    app.get('/api/alunos', auth, (req: any, res) => {
      const rows = db.prepare(`
        SELECT a.*, t.nome as turma_nome, c.tipo as curso_tipo
        FROM alunos a
        LEFT JOIN turmas t ON a.turma_id = t.id
        LEFT JOIN cursos c ON t.curso_id = c.id
        WHERE a.empresa_id = ?
      `).all(req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/alunos', auth, (req: any, res) => {
      const { 
        nome, cpf, rg, data_nascimento, cidade_nascimento, 
        cep, endereco, numero, bairro, cidade, estado, 
        foto, nome_pai, nome_mae, responsavel_legal, 
        telefone, email, problemas_saude, problemas_saude_outros,
        uso_medicamentos, medicamentos_quais, turma_id 
      } = req.body;
      const result = db.prepare(`
        INSERT INTO alunos (
          nome, cpf, rg, data_nascimento, cidade_nascimento, 
          cep, endereco, numero, bairro, cidade, estado, 
          foto, nome_pai, nome_mae, responsavel_legal, 
          telefone, email, problemas_saude, problemas_saude_outros,
          uso_medicamentos, medicamentos_quais, turma_id, empresa_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nome, cpf, rg, data_nascimento, cidade_nascimento, 
        cep, endereco, numero, bairro, cidade, estado, 
        foto, nome_pai, nome_mae, responsavel_legal, 
        telefone, email, JSON.stringify(problemas_saude || []), problemas_saude_outros,
        uso_medicamentos ? 1 : 0, medicamentos_quais, turma_id, req.user.empresa_id
      );
      res.json({ id: result.lastInsertRowid });
    });

    // Employee Endpoints
    app.get('/api/funcionarios', auth, (req: any, res) => {
      const rows = db.prepare("SELECT * FROM funcionarios WHERE empresa_id = ?").all(req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/funcionarios', auth, (req: any, res) => {
      const { 
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao 
      } = req.body;
      const result = db.prepare(`
        INSERT INTO funcionarios (
          nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
          telefone, email, foto, cargo, data_admissao, empresa_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao, req.user.empresa_id
      );
      res.json({ id: result.lastInsertRowid });
    });

    app.post('/api/funcionarios/:id', auth, (req: any, res) => {
      const { 
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao 
      } = req.body;
      db.prepare(`
        UPDATE funcionarios SET 
          nome = ?, cpf = ?, rg = ?, cep = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, estado = ?, 
          telefone = ?, email = ?, foto = ?, cargo = ?, data_admissao = ?
        WHERE id = ? AND empresa_id = ?
      `).run(
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao, req.params.id, req.user.empresa_id
      );
      res.json({ success: true });
    });

    // Permission Endpoints
    app.get('/api/permissoes/:usuarioId', auth, (req: any, res) => {
      const rows = db.prepare("SELECT * FROM permissoes WHERE usuario_id = ? AND empresa_id = ?").all(req.params.usuarioId, req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/permissoes', auth, (req: any, res) => {
      const { usuario_id, tela, pode_acessar, pode_editar, pode_excluir, pode_backup } = req.body;
      const existing = db.prepare("SELECT id FROM permissoes WHERE usuario_id = ? AND tela = ? AND empresa_id = ?").get(usuario_id, tela, req.user.empresa_id) as any;
      
      if (existing) {
        db.prepare("UPDATE permissoes SET pode_acessar = ?, pode_editar = ?, pode_excluir = ?, pode_backup = ? WHERE id = ?").run(
          pode_acessar ? 1 : 0, 
          pode_editar ? 1 : 0, 
          pode_excluir ? 1 : 0, 
          pode_backup ? 1 : 0, 
          existing.id
        );
      } else {
        db.prepare("INSERT INTO permissoes (usuario_id, tela, pode_acessar, pode_editar, pode_excluir, pode_backup, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(usuario_id, tela, pode_acessar ? 1 : 0, pode_editar ? 1 : 0, pode_excluir ? 1 : 0, pode_backup ? 1 : 0, req.user.empresa_id);
      }
      res.json({ success: true });
    });

    app.get('/api/usuarios', auth, (req: any, res) => {
      const rows = db.prepare("SELECT id, nome, email, perfil FROM usuarios WHERE empresa_id = ?").all(req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/alunos/:id', auth, (req: any, res) => {
      const { 
        nome, cpf, rg, data_nascimento, cidade_nascimento, 
        cep, endereco, numero, bairro, cidade, estado, 
        foto, nome_pai, nome_mae, responsavel_legal, 
        telefone, email, problemas_saude, problemas_saude_outros,
        uso_medicamentos, medicamentos_quais, turma_id, motivo_remanejamento 
      } = req.body;
      
      // Check if turma changed to record history
      const currentAluno = db.prepare("SELECT turma_id FROM alunos WHERE id = ?").get(req.params.id) as any;
      if (currentAluno && currentAluno.turma_id !== parseInt(turma_id)) {
        db.prepare("INSERT INTO historico_remanejamentos (empresa_id, aluno_id, turma_anterior_id, turma_nova_id, data_remanejamento, motivo) VALUES (?, ?, ?, ?, ?, ?)")
          .run(req.user.empresa_id, req.params.id, currentAluno.turma_id, turma_id, new Date().toISOString(), motivo_remanejamento || 'Remanejamento de turma');
      }

      db.prepare(`
        UPDATE alunos SET 
          nome = ?, cpf = ?, rg = ?, data_nascimento = ?, cidade_nascimento = ?, 
          cep = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, estado = ?, 
          foto = ?, nome_pai = ?, nome_mae = ?, responsavel_legal = ?, 
          telefone = ?, email = ?, problemas_saude = ?, problemas_saude_outros = ?,
          uso_medicamentos = ?, medicamentos_quais = ?, turma_id = ? 
        WHERE id = ? AND empresa_id = ?
      `).run(
        nome, cpf, rg, data_nascimento, cidade_nascimento, 
        cep, endereco, numero, bairro, cidade, estado, 
        foto, nome_pai, nome_mae, responsavel_legal, 
        telefone, email, JSON.stringify(problemas_saude || []), problemas_saude_outros,
        uso_medicamentos ? 1 : 0, medicamentos_quais, turma_id, req.params.id, req.user.empresa_id
      );
      res.json({ success: true });
    });

    app.get('/api/alunos/:id/historico', auth, (req: any, res) => {
      const rows = db.prepare(`
        SELECT h.*, t1.nome as turma_anterior, t2.nome as turma_nova 
        FROM historico_remanejamentos h
        LEFT JOIN turmas t1 ON h.turma_anterior_id = t1.id
        LEFT JOIN turmas t2 ON h.turma_nova_id = t2.id
        WHERE h.aluno_id = ? AND h.empresa_id = ?
        ORDER BY h.data_remanejamento DESC
      `).all(req.params.id, req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/cursos', auth, (req: any, res) => {
      const { nome, descricao, tipo } = req.body;
      const result = db.prepare("INSERT INTO cursos (nome, descricao, tipo, empresa_id) VALUES (?, ?, ?, ?)").run(nome, descricao, tipo || 'regular', req.user.empresa_id);
      res.json({ id: result.lastInsertRowid });
    });

    app.post('/api/cursos/:id', auth, (req: any, res) => {
      const { nome, descricao, tipo } = req.body;
      db.prepare("UPDATE cursos SET nome = ?, descricao = ?, tipo = ? WHERE id = ? AND empresa_id = ?").run(nome, descricao, tipo || 'regular', req.params.id, req.user.empresa_id);
      res.json({ success: true });
    });

    app.post('/api/disciplinas', auth, (req: any, res) => {
      const { nome, carga_horaria, curso_id, tipo_avaliacao } = req.body;
      const result = db.prepare("INSERT INTO disciplinas (nome, carga_horaria, curso_id, tipo_avaliacao, empresa_id) VALUES (?, ?, ?, ?, ?)").run(nome, carga_horaria, curso_id, tipo_avaliacao || 'nota', req.user.empresa_id);
      res.json({ id: result.lastInsertRowid });
    });

    app.post('/api/disciplinas/:id', auth, (req: any, res) => {
      const { nome, carga_horaria, curso_id, tipo_avaliacao } = req.body;
      db.prepare("UPDATE disciplinas SET nome = ?, carga_horaria = ?, curso_id = ?, tipo_avaliacao = ? WHERE id = ? AND empresa_id = ?").run(nome, carga_horaria, curso_id, tipo_avaliacao || 'nota', req.params.id, req.user.empresa_id);
      res.json({ success: true });
    });

    app.post('/api/turmas', auth, (req: any, res) => {
      const { nome, turno, capacidade, ano_letivo, curso_id } = req.body;
      const result = db.prepare("INSERT INTO turmas (nome, turno, capacidade, ano_letivo, curso_id, empresa_id) VALUES (?, ?, ?, ?, ?, ?)").run(nome, turno, capacidade, ano_letivo, curso_id, req.user.empresa_id);
      res.json({ id: result.lastInsertRowid });
    });

    app.post('/api/turmas/:id', auth, (req: any, res) => {
      const { nome, turno, capacidade, ano_letivo, curso_id } = req.body;
      db.prepare("UPDATE turmas SET nome = ?, turno = ?, capacidade = ?, ano_letivo = ?, curso_id = ? WHERE id = ? AND empresa_id = ?").run(nome, turno, capacidade, ano_letivo, curso_id, req.params.id, req.user.empresa_id);
      res.json({ success: true });
    });

    app.post('/api/matriculas', auth, (req: any, res) => {
      const { aluno_id, turma_id } = req.body;
      const data_matricula = new Date().toISOString().split('T')[0];
      const result = db.prepare("INSERT INTO matriculas (aluno_id, turma_id, data_matricula, empresa_id) VALUES (?, ?, ?, ?)").run(aluno_id, turma_id, data_matricula, req.user.empresa_id);
      
      // Update student's turma_id as well
      db.prepare("UPDATE alunos SET turma_id = ? WHERE id = ? AND empresa_id = ?").run(turma_id, aluno_id, req.user.empresa_id);
      
      res.json({ id: result.lastInsertRowid });
    });

    // Pedagogical Endpoints
    app.post('/api/notas', auth, (req: any, res) => {
      const { aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao } = req.body;
      const result = db.prepare("INSERT INTO notas (aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao, req.user.empresa_id);
      res.json({ id: result.lastInsertRowid });
    });

    app.get('/api/boletim/:alunoId', auth, (req: any, res) => {
      const rows = db.prepare(`
        SELECT n.*, d.nome as disciplina, d.tipo_avaliacao
        FROM notas n 
        JOIN disciplinas d ON n.disciplina_id = d.id 
        WHERE n.aluno_id = ? AND n.empresa_id = ? 
        ORDER BY n.bimestre DESC, n.id DESC`).all(req.params.alunoId, req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/frequencia', auth, (req: any, res) => {
      const { aluno_id, disciplina_id, turma_id, data, status, justificativa } = req.body;
      const result = db.prepare("INSERT INTO frequencias (aluno_id, disciplina_id, turma_id, data, status, justificativa, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?)").run(aluno_id, disciplina_id, turma_id, data, status, justificativa, req.user.empresa_id);
      res.json({ id: result.lastInsertRowid });
    });

    app.get('/api/frequencia/:alunoId', auth, (req: any, res) => {
      const rows = db.prepare("SELECT * FROM frequencias WHERE aluno_id = ? AND empresa_id = ? ORDER BY data DESC").all(req.params.alunoId, req.user.empresa_id);
      const total = rows.length;
      const presentes = rows.filter((r: any) => r.status === 'P').length;
      const justificadas = rows.filter((r: any) => r.status === 'FJ').length;
      res.json({ 
        historico: rows,
        percentual: total > 0 ? ((presentes + justificadas) / total) * 100 : 100
      });
    });

    // Financial Endpoints
    app.get('/api/financeiro', auth, (req: any, res) => {
      const rows = db.prepare(`
        SELECT f.*, a.nome as aluno_nome 
        FROM financeiro f 
        JOIN alunos a ON f.aluno_id = a.id 
        WHERE f.empresa_id = ?`).all(req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/financeiro', auth, (req: any, res) => {
      const { aluno_id, valor, vencimento, status, descricao } = req.body;
      const result = db.prepare("INSERT INTO financeiro (aluno_id, valor, vencimento, status, descricao, empresa_id) VALUES (?, ?, ?, ?, ?, ?)").run(aluno_id, valor, vencimento, status, descricao || 'Mensalidade', req.user.empresa_id);
      res.json({ id: result.lastInsertRowid });
    });

    app.put('/api/financeiro/:id', auth, (req: any, res) => {
      const { status } = req.body;
      db.prepare("UPDATE financeiro SET status = ? WHERE id = ? AND empresa_id = ?").run(status, req.params.id, req.user.empresa_id);
      res.json({ success: true });
    });

    app.delete('/api/financeiro/:id', auth, (req: any, res) => {
      db.prepare("DELETE FROM financeiro WHERE id = ? AND empresa_id = ?").run(req.params.id, req.user.empresa_id);
      res.json({ success: true });
    });

    // Communication Endpoints
    app.get('/api/comunicados', auth, (req: any, res) => {
      const rows = db.prepare("SELECT * FROM comunicados WHERE empresa_id = ? ORDER BY data_postagem DESC").all(req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/comunicados', auth, (req: any, res) => {
      const { titulo, conteudo, alvo } = req.body;
      const data = new Date().toISOString();
      const result = db.prepare("INSERT INTO comunicados (empresa_id, titulo, conteudo, data_postagem, alvo) VALUES (?, ?, ?, ?, ?)").run(req.user.empresa_id, titulo, conteudo, data, alvo || 'todos');
      res.json({ id: result.lastInsertRowid });
    });

    app.put('/api/comunicados/:id', auth, (req: any, res) => {
      const { titulo, conteudo, alvo } = req.body;
      db.prepare("UPDATE comunicados SET titulo = ?, conteudo = ?, alvo = ? WHERE id = ? AND empresa_id = ?").run(titulo, conteudo, alvo || 'todos', req.params.id, req.user.empresa_id);
      res.json({ success: true });
    });

    app.delete('/api/comunicados/:id', auth, (req: any, res) => {
      db.prepare("DELETE FROM comunicados WHERE id = ? AND empresa_id = ?").run(req.params.id, req.user.empresa_id);
      res.json({ success: true });
    });

    app.get('/api/comunicados-aluno/:alunoId', auth, (req: any, res) => {
      const rows = db.prepare(`
        SELECT c.*, (SELECT COUNT(*) FROM comunicados_lidos cl WHERE cl.comunicado_id = c.id AND cl.aluno_id = ?) as lido
        FROM comunicados c 
        WHERE c.empresa_id = ? 
        AND (c.alvo = 'todos' OR c.alvo = 'alunos')
        ORDER BY c.data_postagem DESC
      `).all(req.params.alunoId, req.user.empresa_id);
      res.json(rows);
    });

    app.post('/api/comunicados/marcar-lido', auth, (req: any, res) => {
      const { comunicado_id, aluno_id } = req.body;
      const data = new Date().toISOString();
      db.prepare("INSERT INTO comunicados_lidos (empresa_id, comunicado_id, aluno_id, data_leitura) VALUES (?, ?, ?, ?)").run(req.user.empresa_id, comunicado_id, aluno_id, data);
      res.json({ success: true });
    });

    app.get('/api/comunicados/stats/:id', auth, (req: any, res) => {
      const rows = db.prepare(`
        SELECT a.nome, cl.data_leitura 
        FROM comunicados_lidos cl
        JOIN alunos a ON cl.aluno_id = a.id
        WHERE cl.comunicado_id = ? AND cl.empresa_id = ?
      `).all(req.params.id, req.user.empresa_id);
      res.json(rows);
    });

    app.get('/api/solicitacoes-documentos', auth, (req: any, res) => {
      const { aluno_id } = req.query;
      let query = "SELECT s.*, a.nome as aluno_nome FROM solicitacoes_documentos s JOIN alunos a ON s.aluno_id = a.id WHERE s.empresa_id = ?";
      const params = [req.user.empresa_id];
      
      if (aluno_id) {
        query += " AND s.aluno_id = ?";
        params.push(aluno_id);
      }
      
      const rows = db.prepare(query).all(...params);
      res.json(rows);
    });

    app.post('/api/solicitacoes-documentos', auth, (req: any, res) => {
      const { aluno_id, tipo_documento, observacao } = req.body;
      const data = new Date().toISOString();
      db.prepare("INSERT INTO solicitacoes_documentos (empresa_id, aluno_id, tipo_documento, data_solicitacao, observacao) VALUES (?, ?, ?, ?, ?)").run(req.user.empresa_id, aluno_id, tipo_documento, data, observacao);
      res.json({ success: true });
    });

    app.put('/api/solicitacoes-documentos/:id', auth, (req: any, res) => {
      const { status } = req.body;
      db.prepare("UPDATE solicitacoes_documentos SET status = ? WHERE id = ? AND empresa_id = ?").run(status, req.params.id, req.user.empresa_id);
      res.json({ success: true });
    });

    // Portal Aluno Aggregated Data
    app.get('/api/portal-aluno/:alunoId', auth, (req: any, res) => {
      const aluno = db.prepare("SELECT * FROM alunos WHERE id = ? AND empresa_id = ?").get(req.params.alunoId, req.user.empresa_id);
      const notas = db.prepare(`
        SELECT d.nome as disciplina, COALESCE(AVG(n.valor), 0) as media 
        FROM notas n 
        JOIN disciplinas d ON n.disciplina_id = d.id 
        WHERE n.aluno_id = ? AND n.empresa_id = ? 
        GROUP BY d.id`).all(req.params.alunoId, req.user.empresa_id);
      
      const financeiro = db.prepare("SELECT * FROM financeiro WHERE aluno_id = ? AND empresa_id = ?").all(req.params.alunoId, req.user.empresa_id);
      
      const freqRows = db.prepare("SELECT status FROM frequencias WHERE aluno_id = ? AND empresa_id = ?").all(req.params.alunoId, req.user.empresa_id);
      const totalFreq = freqRows.length;
      const presentes = freqRows.filter((r: any) => r.status === 'P' || r.status === 'FJ').length;
      
      res.json({
        aluno,
        notas,
        financeiro,
        frequencia: {
          percentual: totalFreq > 0 ? (presentes / totalFreq) * 100 : 100
        }
      });
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: process.cwd(),
      });
      app.use(vite.middlewares);
      console.log('Vite middleware carregado.');
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Erro fatal:', error);
  }
}

startServer();
