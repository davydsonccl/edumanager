import { Hono } from 'hono';
import { cors } from 'hono/cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = 'SECRET_KEY_EDU_MANAGER';

class DBWrapper {
  constructor(private d1: any) {}

  prepare(query: string) {
    const stmt = this.d1.prepare(query);
    return {
      get: async (...params: any[]) => {
        return await stmt.bind(...params).first();
      },
      all: async (...params: any[]) => {
        const res = await stmt.bind(...params).all();
        return res.results;
      },
      run: async (...params: any[]) => {
        const res = await stmt.bind(...params).run();
        return { lastInsertRowid: res.meta.last_row_id };
      }
    };
  }
  
  async exec(query: string) {
    await this.d1.exec(query);
  }
}

const app = new Hono<{ Bindings: { DB: any }, Variables: { user: any } }>();
app.use('/api/*', cors());

const auth = async (c: any, next: any) => {
  const token = c.req.header('authorization')?.split(' ')[1];
  if (!token) return c.json({ error: 'Não autorizado' }, 401);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Token inválido' }, 401);
  }
};


app.post('/api/init-db', async (c) => {
  const db = new DBWrapper(c.env.DB);
  try {
    const schema = `
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
    const queries = schema.split(';').map(q => q.replace(/\n/g, ' ').trim()).filter(q => q.length > 0);
    
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
});
app.get('/api/health', async (c) => {
  const db = new DBWrapper(c.env.DB);

      return c.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Rota para download do banco de dados
    app.get('/api/download-db', async (c) => {
  const db = new DBWrapper(c.env.DB);

      return c.json({ error: 'Download DB não suportado no Cloudflare' }, 400);
    });

    // API Routes
   // LOGIN (SEM CRIPTOGRAFIA)
app.post('/api/login', async (c) => {
  const db = new DBWrapper(c.env.DB);

  const { email, senha } = await c.req.json();

  const user = await db.prepare(
    "SELECT * FROM usuarios WHERE email = ? AND senha = ?"
  ).get(email, senha) as any;

  if (!user) {
    return c.json({ error: 'Credenciais inválidas' }, 401);
  }

  const token = jwt.sign({
    id: user.id,
    empresa_id: user.empresa_id,
    aluno_id: user.aluno_id,
    professor_id: user.professor_id,
    nome: user.nome,
    perfil: user.perfil
  }, JWT_SECRET);

  return c.json({
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


// ALTERAR SENHA (SEM CRIPTOGRAFIA)
app.post('/api/change-password', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

  const { novaSenha } = await c.req.json();

  await db.prepare(
    "UPDATE usuarios SET senha = ?, primeiro_acesso = 0 WHERE id = ?"
  ).run(novaSenha, c.get('user').id);

  return c.json({ success: true });
});


// RESETAR SENHA (ADMIN - SEM CRIPTOGRAFIA)
app.post('/api/usuarios/reset-password', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

  if (c.get('user').perfil !== 'admin') {
    return c.json({ error: 'Acesso negado' }, 403);
  }

  const { usuario_id, nova_senha } = await c.req.json();

  await db.prepare(
    "UPDATE usuarios SET senha = ?, primeiro_acesso = 1 WHERE id = ?"
  ).run(nova_senha, usuario_id);

  return c.json({ success: true });
});


// CRIAR USUÁRIO (SEM CRIPTOGRAFIA)
app.post('/api/usuarios/criar', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

  if (c.get('user').perfil !== 'admin') {
    return c.json({ error: 'Acesso negado' }, 403);
  }

  const { nome, email, senha, perfil, aluno_id, professor_id } = await c.req.json();

  try {
    const result = await db.prepare(`
      INSERT INTO usuarios 
      (empresa_id, nome, email, senha, perfil, aluno_id, professor_id, primeiro_acesso)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      c.get('user').empresa_id,
      nome,
      email,
      senha,
      perfil,
      aluno_id || null,
      professor_id || null
    );

    return c.json({ id: result.lastInsertRowid });

  } catch (err) {
    return c.json({ error: 'E-mail já cadastrado ou erro no banco' }, 400);
  }
});

app.get('/api/empresa', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

  const row = await db.prepare(
    "SELECT * FROM empresas WHERE id = ?"
  ).get(c.get('user').empresa_id);

  return c.json(row);
});

app.post('/api/empresa', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

  const { nome, cnpj, endereco, telefone, email, diretor, secretario } = await c.req.json();

  await db.prepare(`
    UPDATE empresas 
    SET nome = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, diretor = ?, secretario = ?
    WHERE id = ?
  `).run(
    nome,
    cnpj,
    endereco,
    telefone,
    email,
    diretor,
    secretario,
    c.get('user').empresa_id
  );

  return c.json({ success: true });
});

    // Academic Endpoints
    app.get('/api/cursos', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare("SELECT * FROM cursos WHERE empresa_id = ?").all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.get('/api/disciplinas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare("SELECT * FROM disciplinas WHERE empresa_id = ?").all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.get('/api/turmas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare(`
        SELECT t.*, c.nome as curso_nome 
        FROM turmas t 
        JOIN cursos c ON t.curso_id = c.id 
        WHERE t.empresa_id = ?`).all(c.get('user').empresa_id);
      return c.json(rows);
    });

    // Student Endpoints
    app.get('/api/alunos', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare(`
        SELECT a.*, t.nome as turma_nome, c.tipo as curso_tipo
        FROM alunos a
        LEFT JOIN turmas t ON a.turma_id = t.id
        LEFT JOIN cursos c ON t.curso_id = c.id
        WHERE a.empresa_id = ?
      `).all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/alunos', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { 
        nome, cpf, rg, data_nascimento, cidade_nascimento, 
        cep, endereco, numero, bairro, cidade, estado, 
        foto, nome_pai, nome_mae, responsavel_legal, 
        telefone, email, problemas_saude, problemas_saude_outros,
        uso_medicamentos, medicamentos_quais, turma_id 
      } = await c.req.json();
      const result = await db.prepare(`
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
        uso_medicamentos ? 1 : 0, medicamentos_quais, turma_id, c.get('user').empresa_id
      );
      return c.json({ id: result.lastInsertRowid });
    });

    // Employee Endpoints
    app.get('/api/funcionarios', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare("SELECT * FROM funcionarios WHERE empresa_id = ?").all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/funcionarios', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { 
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao 
      } = await c.req.json();
      const result = await db.prepare(`
        INSERT INTO funcionarios (
          nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
          telefone, email, foto, cargo, data_admissao, empresa_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao, c.get('user').empresa_id
      );
      return c.json({ id: result.lastInsertRowid });
    });

    app.post('/api/funcionarios/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { 
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao 
      } = await c.req.json();
      await db.prepare(`
        UPDATE funcionarios SET 
          nome = ?, cpf = ?, rg = ?, cep = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, estado = ?, 
          telefone = ?, email = ?, foto = ?, cargo = ?, data_admissao = ?
        WHERE id = ? AND empresa_id = ?
      `).run(
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao, c.req.param('id'), c.get('user').empresa_id
      );
      return c.json({ success: true });
    });

    // Permission Endpoints
    app.get('/api/permissoes/:usuarioId', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare("SELECT * FROM permissoes WHERE usuario_id = ? AND empresa_id = ?").all(c.req.param('usuarioId'), c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/permissoes', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { usuario_id, tela, pode_acessar, pode_editar, pode_excluir, pode_backup } = await c.req.json();
      const existing = await db.prepare("SELECT id FROM permissoes WHERE usuario_id = ? AND tela = ? AND empresa_id = ?").get(usuario_id, tela, c.get('user').empresa_id) as any;
      
      if (existing) {
        await db.prepare("UPDATE permissoes SET pode_acessar = ?, pode_editar = ?, pode_excluir = ?, pode_backup = ? WHERE id = ?").run(
          pode_acessar ? 1 : 0, 
          pode_editar ? 1 : 0, 
          pode_excluir ? 1 : 0, 
          pode_backup ? 1 : 0, 
          existing.id
        );
      } else {
        await db.prepare("INSERT INTO permissoes (usuario_id, tela, pode_acessar, pode_editar, pode_excluir, pode_backup, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(usuario_id, tela, pode_acessar ? 1 : 0, pode_editar ? 1 : 0, pode_excluir ? 1 : 0, pode_backup ? 1 : 0, c.get('user').empresa_id);
      }
      return c.json({ success: true });
    });

    app.get('/api/usuarios', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare("SELECT id, nome, email, perfil FROM usuarios WHERE empresa_id = ?").all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/alunos/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { 
        nome, cpf, rg, data_nascimento, cidade_nascimento, 
        cep, endereco, numero, bairro, cidade, estado, 
        foto, nome_pai, nome_mae, responsavel_legal, 
        telefone, email, problemas_saude, problemas_saude_outros,
        uso_medicamentos, medicamentos_quais, turma_id, motivo_remanejamento 
      } = await c.req.json();
      
      // Check if turma changed to record history
      const currentAluno = await db.prepare("SELECT turma_id FROM alunos WHERE id = ?").get(c.req.param('id')) as any;
      if (currentAluno && currentAluno.turma_id !== parseInt(turma_id)) {
        await db.prepare("INSERT INTO historico_remanejamentos (empresa_id, aluno_id, turma_anterior_id, turma_nova_id, data_remanejamento, motivo) VALUES (?, ?, ?, ?, ?, ?)")
          .run(c.get('user').empresa_id, c.req.param('id'), currentAluno.turma_id, turma_id, new Date().toISOString(), motivo_remanejamento || 'Remanejamento de turma');
      }

      await db.prepare(`
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
        uso_medicamentos ? 1 : 0, medicamentos_quais, turma_id, c.req.param('id'), c.get('user').empresa_id
      );
      return c.json({ success: true });
    });

    app.get('/api/alunos/:id/historico', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare(`
        SELECT h.*, t1.nome as turma_anterior, t2.nome as turma_nova 
        FROM historico_remanejamentos h
        LEFT JOIN turmas t1 ON h.turma_anterior_id = t1.id
        LEFT JOIN turmas t2 ON h.turma_nova_id = t2.id
        WHERE h.aluno_id = ? AND h.empresa_id = ?
        ORDER BY h.data_remanejamento DESC
      `).all(c.req.param('id'), c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/cursos', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { nome, descricao, tipo } = await c.req.json();
      const result = await db.prepare("INSERT INTO cursos (nome, descricao, tipo, empresa_id) VALUES (?, ?, ?, ?)").run(nome, descricao, tipo || 'regular', c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.post('/api/cursos/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { nome, descricao, tipo } = await c.req.json();
      await db.prepare("UPDATE cursos SET nome = ?, descricao = ?, tipo = ? WHERE id = ? AND empresa_id = ?").run(nome, descricao, tipo || 'regular', c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.post('/api/disciplinas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { nome, carga_horaria, curso_id, tipo_avaliacao } = await c.req.json();
      const result = await db.prepare("INSERT INTO disciplinas (nome, carga_horaria, curso_id, tipo_avaliacao, empresa_id) VALUES (?, ?, ?, ?, ?)").run(nome, carga_horaria, curso_id, tipo_avaliacao || 'nota', c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.post('/api/disciplinas/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { nome, carga_horaria, curso_id, tipo_avaliacao } = await c.req.json();
      await db.prepare("UPDATE disciplinas SET nome = ?, carga_horaria = ?, curso_id = ?, tipo_avaliacao = ? WHERE id = ? AND empresa_id = ?").run(nome, carga_horaria, curso_id, tipo_avaliacao || 'nota', c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.post('/api/turmas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { nome, turno, capacidade, ano_letivo, curso_id } = await c.req.json();
      const result = await db.prepare("INSERT INTO turmas (nome, turno, capacidade, ano_letivo, curso_id, empresa_id) VALUES (?, ?, ?, ?, ?, ?)").run(nome, turno, capacidade, ano_letivo, curso_id, c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.post('/api/turmas/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { nome, turno, capacidade, ano_letivo, curso_id } = await c.req.json();
      await db.prepare("UPDATE turmas SET nome = ?, turno = ?, capacidade = ?, ano_letivo = ?, curso_id = ? WHERE id = ? AND empresa_id = ?").run(nome, turno, capacidade, ano_letivo, curso_id, c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.post('/api/matriculas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { aluno_id, turma_id } = await c.req.json();
      const data_matricula = new Date().toISOString().split('T')[0];
      const result = await db.prepare("INSERT INTO matriculas (aluno_id, turma_id, data_matricula, empresa_id) VALUES (?, ?, ?, ?)").run(aluno_id, turma_id, data_matricula, c.get('user').empresa_id);
      
      // Update student's turma_id as well
      await db.prepare("UPDATE alunos SET turma_id = ? WHERE id = ? AND empresa_id = ?").run(turma_id, aluno_id, c.get('user').empresa_id);
      
      return c.json({ id: result.lastInsertRowid });
    });

    // Pedagogical Endpoints
    app.post('/api/notas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao } = await c.req.json();
      const result = await db.prepare("INSERT INTO notas (aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao, c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.get('/api/boletim/:alunoId', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare(`
        SELECT n.*, d.nome as disciplina, d.tipo_avaliacao
        FROM notas n 
        JOIN disciplinas d ON n.disciplina_id = d.id 
        WHERE n.aluno_id = ? AND n.empresa_id = ? 
        ORDER BY n.bimestre DESC, n.id DESC`).all(c.req.param('alunoId'), c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/frequencia', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { aluno_id, disciplina_id, turma_id, data, status, justificativa } = await c.req.json();
      const result = await db.prepare("INSERT INTO frequencias (aluno_id, disciplina_id, turma_id, data, status, justificativa, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?)").run(aluno_id, disciplina_id, turma_id, data, status, justificativa, c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.get('/api/frequencia/:alunoId', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare("SELECT * FROM frequencias WHERE aluno_id = ? AND empresa_id = ? ORDER BY data DESC").all(c.req.param('alunoId'), c.get('user').empresa_id);
      const total = rows.length;
      const presentes = rows.filter((r: any) => r.status === 'P').length;
      const justificadas = rows.filter((r: any) => r.status === 'FJ').length;
      return c.json({ 
        historico: rows,
        percentual: total > 0 ? ((presentes + justificadas) / total) * 100 : 100
      });
    });

    // Financial Endpoints
    app.get('/api/financeiro', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare(`
        SELECT f.*, a.nome as aluno_nome 
        FROM financeiro f 
        JOIN alunos a ON f.aluno_id = a.id 
        WHERE f.empresa_id = ?`).all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/financeiro', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { aluno_id, valor, vencimento, status, descricao } = await c.req.json();
      const result = await db.prepare("INSERT INTO financeiro (aluno_id, valor, vencimento, status, descricao, empresa_id) VALUES (?, ?, ?, ?, ?, ?)").run(aluno_id, valor, vencimento, status, descricao || 'Mensalidade', c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.put('/api/financeiro/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { status } = await c.req.json();
      await db.prepare("UPDATE financeiro SET status = ? WHERE id = ? AND empresa_id = ?").run(status, c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.delete('/api/financeiro/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      await db.prepare("DELETE FROM financeiro WHERE id = ? AND empresa_id = ?").run(c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    // Communication Endpoints
    app.get('/api/comunicados', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare("SELECT * FROM comunicados WHERE empresa_id = ? ORDER BY data_postagem DESC").all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/comunicados', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { titulo, conteudo, alvo } = await c.req.json();
      const data = new Date().toISOString();
      const result = await db.prepare("INSERT INTO comunicados (empresa_id, titulo, conteudo, data_postagem, alvo) VALUES (?, ?, ?, ?, ?)").run(c.get('user').empresa_id, titulo, conteudo, data, alvo || 'todos');
      return c.json({ id: result.lastInsertRowid });
    });

    app.put('/api/comunicados/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { titulo, conteudo, alvo } = await c.req.json();
      await db.prepare("UPDATE comunicados SET titulo = ?, conteudo = ?, alvo = ? WHERE id = ? AND empresa_id = ?").run(titulo, conteudo, alvo || 'todos', c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.delete('/api/comunicados/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      await db.prepare("DELETE FROM comunicados WHERE id = ? AND empresa_id = ?").run(c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.get('/api/comunicados-aluno/:alunoId', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare(`
        SELECT c.*, (SELECT COUNT(*) FROM comunicados_lidos cl WHERE cl.comunicado_id = c.id AND cl.aluno_id = ?) as lido
        FROM comunicados c 
        WHERE c.empresa_id = ? 
        AND (c.alvo = 'todos' OR c.alvo = 'alunos')
        ORDER BY c.data_postagem DESC
      `).all(c.req.param('alunoId'), c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/comunicados/marcar-lido', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { comunicado_id, aluno_id } = await c.req.json();
      const data = new Date().toISOString();
      await db.prepare("INSERT INTO comunicados_lidos (empresa_id, comunicado_id, aluno_id, data_leitura) VALUES (?, ?, ?, ?)").run(c.get('user').empresa_id, comunicado_id, aluno_id, data);
      return c.json({ success: true });
    });

    app.get('/api/comunicados/stats/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare(`
        SELECT a.nome, cl.data_leitura 
        FROM comunicados_lidos cl
        JOIN alunos a ON cl.aluno_id = a.id
        WHERE cl.comunicado_id = ? AND cl.empresa_id = ?
      `).all(c.req.param('id'), c.get('user').empresa_id);
      return c.json(rows);
    });

    app.get('/api/solicitacoes-documentos', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { aluno_id } = c.req.query();
      let query = "SELECT s.*, a.nome as aluno_nome FROM solicitacoes_documentos s JOIN alunos a ON s.aluno_id = a.id WHERE s.empresa_id = ?";
      const params = [c.get('user').empresa_id];
      
      if (aluno_id) {
        query += " AND s.aluno_id = ?";
        params.push(aluno_id);
      }
      
      const rows = await db.prepare(query).all(...params);
      return c.json(rows);
    });

    app.post('/api/solicitacoes-documentos', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { aluno_id, tipo_documento, observacao } = await c.req.json();
      const data = new Date().toISOString();
      await db.prepare("INSERT INTO solicitacoes_documentos (empresa_id, aluno_id, tipo_documento, data_solicitacao, observacao) VALUES (?, ?, ?, ?, ?)").run(c.get('user').empresa_id, aluno_id, tipo_documento, data, observacao);
      return c.json({ success: true });
    });

    app.put('/api/solicitacoes-documentos/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { status } = await c.req.json();
      await db.prepare("UPDATE solicitacoes_documentos SET status = ? WHERE id = ? AND empresa_id = ?").run(status, c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    // Portal Aluno Aggregated Data
    app.get('/api/portal-aluno/:alunoId', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const aluno = await db.prepare("SELECT * FROM alunos WHERE id = ? AND empresa_id = ?").get(c.req.param('alunoId'), c.get('user').empresa_id);
      const notas = await db.prepare(`
        SELECT d.nome as disciplina, COALESCE(AVG(n.valor), 0) as media 
        FROM notas n 
        JOIN disciplinas d ON n.disciplina_id = d.id 
        WHERE n.aluno_id = ? AND n.empresa_id = ? 
        GROUP BY d.id`).all(c.req.param('alunoId'), c.get('user').empresa_id);
      
      const financeiro = await db.prepare("SELECT * FROM financeiro WHERE aluno_id = ? AND empresa_id = ?").all(c.req.param('alunoId'), c.get('user').empresa_id);
      
      const freqRows = await db.prepare("SELECT status FROM frequencias WHERE aluno_id = ? AND empresa_id = ?").all(c.req.param('alunoId'), c.get('user').empresa_id);
      const totalFreq = freqRows.length;
      const presentes = freqRows.filter((r: any) => r.status === 'P' || r.status === 'FJ').length;
      
      return c.json({
        aluno,
        notas,
        financeiro,
        frequencia: {
          percentual: totalFreq > 0 ? (presentes / totalFreq) * 100 : 100
        }
      });
    });

    
export default app;
