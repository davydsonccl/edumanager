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
        try {
          return await stmt.bind(...params).first();
        } catch (e: any) {
          console.error(`DB Error (get): ${e.message} | Query: ${query}`);
          throw e;
        }
      },
      all: async (...params: any[]) => {
        try {
          const res = await stmt.bind(...params).all();
          return res.results;
        } catch (e: any) {
          console.error(`DB Error (all): ${e.message} | Query: ${query}`);
          throw e;
        }
      },
      run: async (...params: any[]) => {
        try {
          const res = await stmt.bind(...params).run();
          return { lastInsertRowid: res?.meta?.last_row_id || res?.lastRowId || null };
        } catch (e: any) {
          throw e;
        }
      }
    };
  }
  
  async exec(query: string) {
    try {
      await this.d1.exec(query);
    } catch (e: any) {
      throw e;
    }
  }
}

const app = new Hono<{ Bindings: { DB: any }, Variables: { user: any } }>();
app.use('/api/*', cors());

const toInt = (val: any) => {
  if (val === undefined || val === null || val === '') return null;
  const parsed = parseInt(val);
  return isNaN(parsed) ? null : parsed;
};

app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ 
    error: err.message,
    stack: err.stack,
    cause: err.cause
  }, 500);
});

const auth = async (c: any, next: any) => {
  const token = c.req.header('authorization')?.split(' ')[1];
  if (!token) return c.json({ error: 'Não autorizado' }, 401);

  if (token === 'dev-token') {
    c.set('user', { id: 1, empresa_id: 1, perfil: 'admin' });
    await next();
    return;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Support switching schools for super admins
    const requestedEmpresaId = c.req.header('x-empresa-id');
    if (requestedEmpresaId && decoded.super_admin) {
      const parsedId = parseInt(requestedEmpresaId);
      if (!isNaN(parsedId)) {
        decoded.empresa_id = parsedId;
      }
    }
    
    c.set('user', { ...decoded });
    await next();
  } catch (err) {
    return c.json({ error: 'Token inválido' }, 401);
  }
};


app.post('/api/init-db', async (c) => {
  console.log('Iniciando init-db...');
  if (!c.env.DB) {
    console.error('Erro: c.env.DB não encontrado');
    return c.json({ error: 'Database binding missing' }, 500);
  }
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
  logo_url TEXT,
  msg_cobranca_whatsapp TEXT,
  msg_cobranca_email TEXT,
  cor_primaria TEXT DEFAULT '#4f46e5',
  tema TEXT DEFAULT 'light'
);
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  professor_id INTEGER,
  curso_id INTEGER,
  turma_id INTEGER,
  ano_letivo INTEGER,
  nome TEXT,
  email TEXT UNIQUE,
  senha TEXT,
  perfil TEXT,
  super_admin INTEGER DEFAULT 0,
  primeiro_acesso INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ativo'
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
  whatsapp_responsavel TEXT,
  email_responsavel TEXT,
  telefone TEXT,
  email TEXT,
  problemas_saude TEXT,
  problemas_saude_outros TEXT,
  uso_medicamentos INTEGER DEFAULT 0,
  medicamentos_quais TEXT,
  status TEXT DEFAULT 'ativo',
  posicao_sala INTEGER,
  fileira INTEGER,
  assento INTEGER,
  matricula TEXT,
  nis TEXT,
  cor_raca TEXT,
  deficiencia INTEGER DEFAULT 0,
  deficiencia_tipo TEXT,
  nacionalidade TEXT,
  certidao_nascimento TEXT,
  pais_origem TEXT,
  municipio_nascimento TEXT,
  zona_residencial TEXT,
  localizacao_diferenciada TEXT
);
CREATE TABLE IF NOT EXISTS transferencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER,
  escola_origem_id INTEGER,
  escola_destino_id INTEGER,
  tipo TEXT, -- 'interna' ou 'externa'
  escola_externa_nome TEXT,
  motivo TEXT,
  status TEXT DEFAULT 'pendente', -- 'pendente', 'aprovada', 'rejeitada', 'concluida'
  data_solicitacao TEXT,
  data_aprovacao TEXT,
  observacoes TEXT
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
  status TEXT DEFAULT 'ativo',
  disciplina_id INTEGER,
  turma_id INTEGER
);
CREATE TABLE IF NOT EXISTS permissoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  usuario_id INTEGER,
  tela TEXT,
  pode_acessar INTEGER DEFAULT 1,
  pode_editar INTEGER DEFAULT 0,
  pode_excluir INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS professor_vinculos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  funcionario_id INTEGER,
  disciplina_id INTEGER,
  turma_id INTEGER
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
CREATE TABLE IF NOT EXISTS solicitacoes_financeiras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  aluno_id INTEGER,
  financeiro_id INTEGER,
  status TEXT DEFAULT 'pendente',
  data_solicitacao TEXT,
  observacao TEXT
);
`;
    const queries = schema.split(';').map(q => q.trim()).filter(q => q.length > 0);
    
    for (const q of queries) {
      try {
        await db.exec(q);
      } catch (e: any) {
        console.error(`Init DB Query Error: ${e.message} | Query: ${q}`);
      }
    }

    // Migrations for existing tables
    const migrations = [
      "ALTER TABLE usuarios ADD COLUMN curso_id INTEGER",
      "ALTER TABLE usuarios ADD COLUMN turma_id INTEGER",
      "ALTER TABLE usuarios ADD COLUMN ano_letivo INTEGER",
      "ALTER TABLE empresas ADD COLUMN msg_cobranca_whatsapp TEXT",
      "ALTER TABLE empresas ADD COLUMN msg_cobranca_email TEXT",
      "ALTER TABLE alunos ADD COLUMN posicao_sala INTEGER",
      "ALTER TABLE alunos ADD COLUMN fileira INTEGER",
      "ALTER TABLE alunos ADD COLUMN assento INTEGER",
      "ALTER TABLE alunos ADD COLUMN whatsapp_responsavel TEXT",
      "ALTER TABLE alunos ADD COLUMN email_responsavel TEXT",
      "ALTER TABLE funcionarios ADD COLUMN disciplina_id INTEGER",
      "ALTER TABLE funcionarios ADD COLUMN turma_id INTEGER",
      "ALTER TABLE usuarios ADD COLUMN funcionario_id INTEGER",
      "ALTER TABLE usuarios ADD COLUMN super_admin INTEGER DEFAULT 0",
      "ALTER TABLE empresas ADD COLUMN cor_primaria TEXT DEFAULT '#4f46e5'",
      "ALTER TABLE empresas ADD COLUMN tema TEXT DEFAULT 'light'",
      "ALTER TABLE alunos ADD COLUMN matricula TEXT",
      "ALTER TABLE alunos ADD COLUMN nis TEXT",
      "ALTER TABLE alunos ADD COLUMN cor_raca TEXT",
      "ALTER TABLE alunos ADD COLUMN deficiencia INTEGER DEFAULT 0",
      "ALTER TABLE alunos ADD COLUMN deficiencia_tipo TEXT",
      "ALTER TABLE alunos ADD COLUMN nacionalidade TEXT",
      "ALTER TABLE alunos ADD COLUMN pais_origem TEXT",
      "ALTER TABLE alunos ADD COLUMN municipio_nascimento TEXT",
      "ALTER TABLE alunos ADD COLUMN zona_residencial TEXT",
      "ALTER TABLE alunos ADD COLUMN localizacao_diferenciada TEXT"
    ];

    for (const m of migrations) {
      try {
        await db.exec(m);
      } catch (e: any) {
        // Ignore errors like "duplicate column name"
        if (!e.message.includes("duplicate column name")) {
          console.error(`Migration Error: ${e.message} | Query: ${m}`);
        }
      }
    }

    // Ensure admin@admin.com is super_admin
    await db.prepare("UPDATE usuarios SET super_admin = 1 WHERE email = 'admin@admin.com'").run();

    // Seed initial data
    const empresaCount = await db.prepare("SELECT count(*) as count FROM empresas").get() as any;
    if (empresaCount.count === 0) {
      await db.prepare("INSERT INTO empresas (nome, cnpj, endereco, telefone, email, diretor, secretario, plano) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run("Escola EduManager", "00.000.000/0001-00", "Rua das Flores, 123 - Centro", "(11) 99999-9999", "contato@edumanager.com", "Dr. Roberto Silva", "Maria Oliveira", "Premium");
      
      const hash = bcrypt.hashSync('123', 10);
      await db.prepare("INSERT INTO usuarios (empresa_id, nome, email, senha, perfil, super_admin) VALUES (?, ?, ?, ?, ?, ?)").run(1, 'Admin', 'admin@admin.com', hash, 'admin', 1);
      
      await db.prepare("INSERT INTO cursos (empresa_id, nome, descricao) VALUES (?, ?, ?)").run(1, 'Ensino Fundamental II', '6º ao 9º ano');
      await db.prepare("INSERT INTO disciplinas (empresa_id, curso_id, nome, carga_horaria) VALUES (?, ?, ?, ?)").run(1, 1, 'Matemática', 80);
      await db.prepare("INSERT INTO disciplinas (empresa_id, curso_id, nome, carga_horaria) VALUES (?, ?, ?, ?)").run(1, 1, 'Português', 80);
      await db.prepare("INSERT INTO turmas (empresa_id, curso_id, nome, turno, capacidade, ano_letivo) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, '6º Ano A', 'Manhã', 30, 2026);
      
      await db.prepare("INSERT INTO alunos (empresa_id, nome, cpf, status) VALUES (?, ?, ?, ?)").run(1, "João Silva", "123.456.789-00", 'ativo');
      await db.prepare("INSERT INTO usuarios (empresa_id, aluno_id, nome, email, senha, perfil) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'João Silva', 'aluno@aluno.com', hash, 'aluno');
      await db.prepare("INSERT INTO matriculas (empresa_id, aluno_id, turma_id, data_matricula) VALUES (?, ?, ?, ?)").run(1, 1, 1, '2026-01-15');
      
      await db.prepare("INSERT INTO financeiro (empresa_id, aluno_id, descricao, valor, vencimento, status) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'Mensalidade Março', 450.00, '2026-03-10', 'pago');
      await db.prepare("INSERT INTO financeiro (empresa_id, aluno_id, descricao, valor, vencimento, status) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'Mensalidade Abril', 450.00, '2026-04-10', 'atrasado');
      await db.prepare("INSERT INTO financeiro (empresa_id, aluno_id, descricao, valor, vencimento, status) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'Taxa de Material', 200.00, '2026-05-10', 'pendente');
      
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
    app.post('/api/login', async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { email, senha } = await c.req.json();
      const user = await db.prepare("SELECT * FROM usuarios WHERE email = ?").get(email) as any;
      if (!user) return c.json({ error: 'Usuário não encontrado' }, 404);
      const ok = bcrypt.compareSync(senha, user.senha);
      if (!ok) return c.json({ error: 'Senha incorreta' }, 401);
      
      const token = jwt.sign({ 
        id: user.id, 
        empresa_id: user.empresa_id, 
        aluno_id: user.aluno_id,
        professor_id: user.professor_id,
        funcionario_id: user.funcionario_id,
        nome: user.nome, 
        perfil: user.perfil,
        super_admin: user.super_admin === 1
      }, JWT_SECRET);
      
      return c.json({ 
        token, 
        user: { 
          id: user.id,
          nome: user.nome, 
          email: user.email, 
          perfil: user.perfil, 
          empresa_id: user.empresa_id,
          super_admin: user.super_admin === 1,
          aluno_id: user.aluno_id, 
          professor_id: user.professor_id,
          funcionario_id: user.funcionario_id,
          primeiro_acesso: user.primeiro_acesso === 1
        } 
      });
    });

    app.post('/api/change-password', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const { novaSenha } = await c.req.json();
      const hash = bcrypt.hashSync(novaSenha, 10);
      await db.prepare("UPDATE usuarios SET senha = ?, primeiro_acesso = 0 WHERE id = ?").run(hash, c.get('user').id);
      return c.json({ success: true });
    });

    app.post('/api/usuarios/reset-password', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);
      const user = c.get('user');
      if (user.perfil !== 'admin' && !user.super_admin) return c.json({ error: 'Acesso negado' }, 403);
      const { usuario_id, nova_senha } = await c.req.json();
      const hash = bcrypt.hashSync(nova_senha, 10);
      await db.prepare("UPDATE usuarios SET senha = ?, primeiro_acesso = 1 WHERE id = ?").run(hash, usuario_id);
      return c.json({ success: true });
    });

    app.post('/api/usuarios/criar', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);
      const user = c.get('user');
      if (user.perfil !== 'admin' && !user.super_admin) return c.json({ error: 'Acesso negado' }, 403);
      const data = await c.req.json();
      const { nome, email, senha, perfil } = data;
      const aluno_id = toInt(data.aluno_id);
      const professor_id = toInt(data.professor_id);
      const funcionario_id = toInt(data.funcionario_id);
      const curso_id = toInt(data.curso_id);
      const turma_id = toInt(data.turma_id);
      const ano_letivo = toInt(data.ano_letivo);

      const hash = bcrypt.hashSync(senha, 10);
      try {
        const result = await db.prepare(`
          INSERT INTO usuarios (empresa_id, nome, email, senha, perfil, aluno_id, professor_id, funcionario_id, curso_id, turma_id, ano_letivo, primeiro_acesso)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(c.get('user').empresa_id, nome, email, hash, perfil, aluno_id, professor_id, funcionario_id, curso_id, turma_id, ano_letivo);
        return c.json({ id: result.lastInsertRowid });
      } catch (err: any) {
        return c.json({ error: 'E-mail já cadastrado ou erro no banco: ' + err.message }, 400);
      }
    });

    app.put('/api/usuarios/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const user = c.get('user');
      if (user.perfil !== 'admin' && !user.super_admin) return c.json({ error: 'Acesso negado' }, 403);
      const data = await c.req.json();
      const { nome, email, perfil, status } = data;
      const curso_id = toInt(data.curso_id);
      const turma_id = toInt(data.turma_id);
      const ano_letivo = toInt(data.ano_letivo);

      await db.prepare(`
        UPDATE usuarios SET nome = ?, email = ?, perfil = ?, curso_id = ?, turma_id = ?, ano_letivo = ?, status = ?
        WHERE id = ? AND empresa_id = ?
      `).run(nome, email, perfil, curso_id, turma_id, ano_letivo, status, c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.delete('/api/usuarios/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const user = c.get('user');
      if (user.perfil !== 'admin' && !user.super_admin) return c.json({ error: 'Acesso negado' }, 403);
      await db.prepare("DELETE FROM usuarios WHERE id = ? AND empresa_id = ?").run(c.req.param('id'), user.empresa_id);
      return c.json({ success: true });
    });

    app.get('/api/empresa', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const row = await db.prepare("SELECT * FROM empresas WHERE id = ?").get(c.get('user').empresa_id);
      return c.json(row);
    });

    app.post('/api/empresa', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const { nome, cnpj, endereco, telefone, email, diretor, secretario, logo_url, msg_cobranca_whatsapp, msg_cobranca_email, cor_primaria, tema } = await c.req.json();
      
      // Only super_admin can change theme and primary color
      const currentUser = c.get('user');
      const existing = await db.prepare("SELECT cor_primaria, tema FROM empresas WHERE id = ?").get(currentUser.empresa_id) as any;
      
      const finalCor = currentUser.super_admin ? cor_primaria : (existing?.cor_primaria || '#4f46e5');
      const finalTema = currentUser.super_admin ? tema : (existing?.tema || 'light');

      await db.prepare(`
        UPDATE empresas SET 
          nome = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, 
          diretor = ?, secretario = ?, logo_url = ?, 
          msg_cobranca_whatsapp = ?, msg_cobranca_email = ?,
          cor_primaria = ?, tema = ?
        WHERE id = ?
      `).run(nome, cnpj, endereco, telefone, email, diretor, secretario, logo_url, msg_cobranca_whatsapp, msg_cobranca_email, finalCor, finalTema, currentUser.empresa_id);
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
        SELECT a.*, t.nome as turma_nome, c.tipo as curso_tipo, m.data_matricula
        FROM alunos a
        LEFT JOIN turmas t ON a.turma_id = t.id
        LEFT JOIN cursos c ON t.curso_id = c.id
        LEFT JOIN matriculas m ON a.id = m.aluno_id AND a.turma_id = m.turma_id
        WHERE a.empresa_id = ?
      `).all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/alunos', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const data = await c.req.json();
      let { 
        nome, cpf, rg = null, data_nascimento, cidade_nascimento = null, 
        cep = null, endereco = null, numero = null, bairro = null, cidade = null, estado = null, 
        foto = null, nome_pai = null, nome_mae = null, responsavel_legal = null, 
        telefone = null, email = null, problemas_saude = [], problemas_saude_outros = null,
        uso_medicamentos = 0, medicamentos_quais = null, whatsapp_responsavel = null, email_responsavel = null
      } = data;
      
      // Clean CPF
      cpf = cpf ? cpf.replace(/\D/g, '') : null;
      if (cpf) {
        const existing = await db.prepare("SELECT id FROM alunos WHERE cpf = ? AND empresa_id = ?").get(cpf, c.get('user').empresa_id);
        if (existing) {
          return c.json({ error: 'Já existe um aluno cadastrado com este CPF.' }, 400);
        }
      }

      const turma_id = toInt(data.turma_id);
      const posicao_sala = toInt(data.posicao_sala);
      const fileira = toInt(data.fileira);
      const assento = toInt(data.assento);

      const result = await db.prepare(`
        INSERT INTO alunos (
          nome, cpf, rg, data_nascimento, cidade_nascimento, 
          cep, endereco, numero, bairro, cidade, estado, 
          foto, nome_pai, nome_mae, responsavel_legal, 
          telefone, email, problemas_saude, problemas_saude_outros,
          uso_medicamentos, medicamentos_quais, turma_id, posicao_sala, 
          fileira, assento, whatsapp_responsavel, email_responsavel, empresa_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nome, cpf, rg, data_nascimento, cidade_nascimento, 
        cep, endereco, numero, bairro, cidade, estado, 
        foto, nome_pai, nome_mae, responsavel_legal, 
        telefone, email, JSON.stringify(problemas_saude), problemas_saude_outros,
        uso_medicamentos ? 1 : 0, medicamentos_quais, turma_id, posicao_sala,
        fileira, assento, whatsapp_responsavel, email_responsavel, c.get('user').empresa_id
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

      const data = await c.req.json();
      let { 
        nome, cpf, rg = null, cep = null, endereco = null, numero = null, bairro = null, cidade = null, estado = null, 
        telefone = null, email = null, foto = null, cargo = null, data_admissao = null
      } = data;
      
      // Clean CPF
      cpf = cpf ? cpf.replace(/\D/g, '') : null;
      if (cpf) {
        const existing = await db.prepare("SELECT id FROM funcionarios WHERE cpf = ? AND empresa_id = ?").get(cpf, c.get('user').empresa_id);
        if (existing) {
          return c.json({ error: 'Já existe um funcionário cadastrado com este CPF.' }, 400);
        }
      }

      const disciplina_id = toInt(data.disciplina_id);
      const turma_id = toInt(data.turma_id);

      const result = await db.prepare(`
        INSERT INTO funcionarios (
          nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
          telefone, email, foto, cargo, data_admissao, disciplina_id, turma_id, empresa_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao, disciplina_id, turma_id, c.get('user').empresa_id
      );
      return c.json({ id: result.lastInsertRowid });
    });

    app.post('/api/funcionarios/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const data = await c.req.json();
      let { 
        nome, cpf, rg = null, cep = null, endereco = null, numero = null, bairro = null, cidade = null, estado = null, 
        telefone = null, email = null, foto = null, cargo = null, data_admissao = null
      } = data;
      
      // Clean CPF
      cpf = cpf ? cpf.replace(/\D/g, '') : null;
      if (cpf) {
        const existing = await db.prepare("SELECT id FROM funcionarios WHERE cpf = ? AND empresa_id = ? AND id != ?").get(cpf, c.get('user').empresa_id, c.req.param('id'));
        if (existing) {
          return c.json({ error: 'Já existe outro funcionário cadastrado com este CPF.' }, 400);
        }
      }

      const disciplina_id = toInt(data.disciplina_id);
      const turma_id = toInt(data.turma_id);

      await db.prepare(`
        UPDATE funcionarios SET 
          nome = ?, cpf = ?, rg = ?, cep = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, estado = ?, 
          telefone = ?, email = ?, foto = ?, cargo = ?, data_admissao = ?, disciplina_id = ?, turma_id = ?
        WHERE id = ? AND empresa_id = ?
      `).run(
        nome, cpf, rg, cep, endereco, numero, bairro, cidade, estado, 
        telefone, email, foto, cargo, data_admissao, disciplina_id, turma_id, c.req.param('id'), c.get('user').empresa_id
      );
      return c.json({ success: true });
    });

    // Transfer Endpoints
    app.get('/api/empresas-rede', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const rows = await db.prepare("SELECT id, nome FROM empresas WHERE id != ?").all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.get('/api/todas-empresas', auth, async (c) => {
      if (!c.get('user').super_admin) return c.json({ error: 'Acesso negado' }, 403);
      const db = new DBWrapper(c.env.DB);
      const rows = await db.prepare("SELECT id, nome FROM empresas").all();
      return c.json(rows);
    });

    app.post('/api/empresas', auth, async (c) => {
      if (!c.get('user').super_admin) return c.json({ error: 'Acesso negado' }, 403);
      const db = new DBWrapper(c.env.DB);
      try {
        const { nome, cnpj, endereco, telefone, email, admin_email, admin_senha } = await c.req.json();
        if (!nome) return c.json({ error: 'Nome da escola é obrigatório' }, 400);
        
        const res = await db.prepare("INSERT INTO empresas (nome, cnpj, endereco, telefone, email) VALUES (?, ?, ?, ?, ?)").run(nome, cnpj, endereco, telefone, email);
        const empresaId = res.lastInsertRowid;

        // Create admin user for this school if credentials provided
        if (admin_email && admin_senha) {
          const hash = bcrypt.hashSync(admin_senha, 10);
          await db.prepare("INSERT INTO usuarios (empresa_id, nome, email, senha, perfil, super_admin) VALUES (?, ?, ?, ?, ?, ?)").run(empresaId, `Admin ${nome}`, admin_email, hash, 'admin', 0);
        }
        
        return c.json({ id: empresaId });
      } catch (err: any) {
        console.error('Erro ao cadastrar empresa:', err);
        return c.json({ error: err.message }, 500);
      }
    });

    app.put('/api/empresas/:id', auth, async (c) => {
      if (!c.get('user').super_admin) return c.json({ error: 'Acesso negado' }, 403);
      const db = new DBWrapper(c.env.DB);
      const { nome, cnpj, endereco, telefone, email, cor_primaria, tema, diretor, secretario, logo_url, msg_cobranca_whatsapp, msg_cobranca_email } = await c.req.json();
      await db.prepare(`
        UPDATE empresas SET 
          nome = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, 
          cor_primaria = ?, tema = ?, diretor = ?, secretario = ?, 
          logo_url = ?, msg_cobranca_whatsapp = ?, msg_cobranca_email = ?
        WHERE id = ?
      `).run(nome, cnpj, endereco, telefone, email, cor_primaria, tema, diretor, secretario, logo_url, msg_cobranca_whatsapp, msg_cobranca_email, c.req.param('id'));
      return c.json({ success: true });
    });

    app.delete('/api/empresas/:id', auth, async (c) => {
      if (!c.get('user').super_admin) return c.json({ error: 'Acesso negado' }, 403);
      const db = new DBWrapper(c.env.DB);
      await db.prepare("DELETE FROM empresas WHERE id = ?").run(c.req.param('id'));
      return c.json({ success: true });
    });

    app.get('/api/transferencias', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const empresa_id = c.get('user').empresa_id;
      
      const rows = await db.prepare(`
        SELECT t.*, a.nome as aluno_nome, e_origem.nome as escola_origem_nome, e_destino.nome as escola_destino_nome
        FROM transferencias t
        JOIN alunos a ON t.aluno_id = a.id
        LEFT JOIN empresas e_origem ON t.escola_origem_id = e_origem.id
        LEFT JOIN empresas e_destino ON t.escola_destino_id = e_destino.id
        WHERE t.escola_origem_id = ? OR t.escola_destino_id = ?
        ORDER BY t.data_solicitacao DESC
      `).all(empresa_id, empresa_id);
      
      return c.json(rows);
    });

    app.post('/api/transferencias', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const data = await c.req.json();
      const { aluno_id, escola_destino_id, tipo, escola_externa_nome, motivo, observacoes } = data;
      const escola_origem_id = c.get('user').empresa_id;
      const data_solicitacao = new Date().toISOString();

      const res = await db.prepare(`
        INSERT INTO transferencias (aluno_id, escola_origem_id, escola_destino_id, tipo, escola_externa_nome, motivo, status, data_solicitacao, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, 'pendente', ?, ?)
      `).run(aluno_id, escola_origem_id, escola_destino_id, tipo, escola_externa_nome, motivo, data_solicitacao, observacoes);

      return c.json({ id: res.lastInsertRowid });
    });

    app.post('/api/transferencias/requisitar', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const data = await c.req.json();
      const { aluno_cpf, escola_origem_id, motivo, observacoes } = data;
      const escola_destino_id = c.get('user').empresa_id;
      const data_solicitacao = new Date().toISOString();

      const aluno = await db.prepare("SELECT id FROM alunos WHERE cpf = ? AND empresa_id = ?").get(aluno_cpf.replace(/\D/g, ''), escola_origem_id);
      
      if (!aluno) {
        return c.json({ error: 'Aluno não encontrado na escola de origem com este CPF.' }, 404);
      }

      const res = await db.prepare(`
        INSERT INTO transferencias (aluno_id, escola_origem_id, escola_destino_id, tipo, motivo, status, data_solicitacao, observacoes)
        VALUES (?, ?, ?, 'interna', ?, 'pendente', ?, ?)
      `).run(aluno.id, escola_origem_id, escola_destino_id, motivo, data_solicitacao, observacoes);

      return c.json({ id: res.lastInsertRowid });
    });

    app.post('/api/transferencias/:id/status', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const { status, observacoes } = await c.req.json();
      const id = c.req.param('id');
      const empresa_id = c.get('user').empresa_id;
      const data_aprovacao = new Date().toISOString();

      const transfer = await db.prepare("SELECT * FROM transferencias WHERE id = ?").get(id);
      if (!transfer) return c.json({ error: 'Transferência não encontrada' }, 404);

      if (status === 'aprovada') {
        if (transfer.escola_origem_id !== empresa_id) {
          return c.json({ error: 'Apenas a escola de origem pode aprovar a saída do aluno.' }, 403);
        }

        if (transfer.tipo === 'interna' && transfer.escola_destino_id) {
          await db.prepare("UPDATE alunos SET empresa_id = ?, turma_id = NULL WHERE id = ?").run(transfer.escola_destino_id, transfer.aluno_id);
          await db.prepare("UPDATE usuarios SET empresa_id = ?, turma_id = NULL WHERE aluno_id = ?").run(transfer.escola_destino_id, transfer.aluno_id);
          
          // Move academic data to the new school
          await db.prepare("UPDATE frequencias SET empresa_id = ? WHERE aluno_id = ?").run(transfer.escola_destino_id, transfer.aluno_id);
          await db.prepare("UPDATE notas SET empresa_id = ? WHERE aluno_id = ?").run(transfer.escola_destino_id, transfer.aluno_id);
          await db.prepare("UPDATE matriculas SET empresa_id = ? WHERE aluno_id = ?").run(transfer.escola_destino_id, transfer.aluno_id);
          await db.prepare("UPDATE financeiro SET empresa_id = ? WHERE aluno_id = ?").run(transfer.escola_destino_id, transfer.aluno_id);
        } else if (transfer.tipo === 'externa') {
          await db.prepare("UPDATE alunos SET status = 'transferido' WHERE id = ?").run(transfer.aluno_id);
        }
      }

      await db.prepare(`
        UPDATE transferencias SET status = ?, data_aprovacao = ?, observacoes = COALESCE(?, observacoes)
        WHERE id = ?
      `).run(status, data_aprovacao, observacoes, id);

      return c.json({ success: true });
    });

    app.get('/api/escola-atual', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const row = await db.prepare("SELECT * FROM empresas WHERE id = ?").get(c.get('user').empresa_id);
      return c.json(row);
    });

    app.get('/api/professor-vinculos/:funcionarioId', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const rows = await db.prepare("SELECT * FROM professor_vinculos WHERE funcionario_id = ? AND empresa_id = ?").all(c.req.param('funcionarioId'), c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/professor-vinculos', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const { funcionario_id, vinculos } = await c.req.json();
      
      await db.prepare("DELETE FROM professor_vinculos WHERE funcionario_id = ? AND empresa_id = ?").run(funcionario_id, c.get('user').empresa_id);
      
      if (vinculos && Array.isArray(vinculos)) {
        for (const v of vinculos) {
          await db.prepare("INSERT INTO professor_vinculos (empresa_id, funcionario_id, disciplina_id, turma_id) VALUES (?, ?, ?, ?)")
            .run(c.get('user').empresa_id, funcionario_id, v.disciplina_id, v.turma_id);
        }
      }
      
      return c.json({ success: true });
    });

    app.delete('/api/funcionarios/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      await db.prepare("DELETE FROM funcionarios WHERE id = ? AND empresa_id = ?").run(c.req.param('id'), c.get('user').empresa_id);
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

      const { usuario_id, tela, pode_acessar, pode_editar, pode_excluir } = await c.req.json();
      const existing = await db.prepare("SELECT id FROM permissoes WHERE usuario_id = ? AND tela = ? AND empresa_id = ?").get(usuario_id, tela, c.get('user').empresa_id) as any;
      
      if (existing) {
        await db.prepare("UPDATE permissoes SET pode_acessar = ?, pode_editar = ?, pode_excluir = ? WHERE id = ?").run(
          pode_acessar ? 1 : 0, 
          pode_editar ? 1 : 0, 
          pode_excluir ? 1 : 0, 
          existing.id
        );
      } else {
        await db.prepare("INSERT INTO permissoes (usuario_id, tela, pode_acessar, pode_editar, pode_excluir, empresa_id) VALUES (?, ?, ?, ?, ?, ?)")
          .run(usuario_id, tela, pode_acessar ? 1 : 0, pode_editar ? 1 : 0, pode_excluir ? 1 : 0, c.get('user').empresa_id);
      }
      return c.json({ success: true });
    });

    app.get('/api/usuarios', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare("SELECT id, nome, email, perfil, aluno_id, professor_id, funcionario_id FROM usuarios WHERE empresa_id = ?").all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/alunos/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const data = await c.req.json();
      let { 
        nome, cpf, rg = null, data_nascimento, cidade_nascimento = null, 
        cep = null, endereco = null, numero = null, bairro = null, cidade = null, estado = null, 
        foto = null, nome_pai = null, nome_mae = null, responsavel_legal = null, 
        telefone = null, email = null, problemas_saude = [], problemas_saude_outros = null,
        uso_medicamentos = 0, medicamentos_quais = null, whatsapp_responsavel = null, email_responsavel = null, motivo_remanejamento = null 
      } = data;
      
      // Clean CPF
      cpf = cpf ? cpf.replace(/\D/g, '') : null;
      if (cpf) {
        const existing = await db.prepare("SELECT id FROM alunos WHERE cpf = ? AND empresa_id = ? AND id != ?").get(cpf, c.get('user').empresa_id, c.req.param('id'));
        if (existing) {
          return c.json({ error: 'Já existe outro aluno cadastrado com este CPF.' }, 400);
        }
      }

      const turma_id = toInt(data.turma_id);
      const posicao_sala = toInt(data.posicao_sala);
      const fileira = toInt(data.fileira);
      const assento = toInt(data.assento);
      
      // Check if turma changed to record history
      const currentAluno = await db.prepare("SELECT turma_id FROM alunos WHERE id = ?").get(c.req.param('id')) as any;
      if (currentAluno && currentAluno.turma_id !== turma_id) {
        await db.prepare("INSERT INTO historico_remanejamentos (empresa_id, aluno_id, turma_anterior_id, turma_nova_id, data_remanejamento, motivo) VALUES (?, ?, ?, ?, ?, ?)")
          .run(c.get('user').empresa_id, c.req.param('id'), currentAluno.turma_id, turma_id, new Date().toISOString(), motivo_remanejamento || 'Remanejamento de turma');
        
        if (turma_id) {
          // Carry over academic data (grades and attendance) matching by discipline name
          const newTurma = await db.prepare("SELECT curso_id FROM turmas WHERE id = ?").get(turma_id) as any;
          if (newTurma) {
            const newDisciplinas = await db.prepare("SELECT id, nome FROM disciplinas WHERE curso_id = ?").all(newTurma.curso_id) as any[];
            for (const d of newDisciplinas) {
              // Update grades
              await db.prepare(`
                UPDATE notas 
                SET turma_id = ?, disciplina_id = ? 
                WHERE aluno_id = ? AND disciplina_id IN (
                  SELECT id FROM disciplinas WHERE UPPER(TRIM(nome)) = UPPER(TRIM(?))
                )
              `).run(turma_id, d.id, c.req.param('id'), d.nome);

              // Update attendance
              await db.prepare(`
                UPDATE frequencias 
                SET turma_id = ?, disciplina_id = ? 
                WHERE aluno_id = ? AND disciplina_id IN (
                  SELECT id FROM disciplinas WHERE UPPER(TRIM(nome)) = UPPER(TRIM(?))
                )
              `).run(turma_id, d.id, c.req.param('id'), d.nome);
            }
          }
          
          // Also update the current matricula to the new turma
          await db.prepare("UPDATE matriculas SET turma_id = ? WHERE aluno_id = ? AND empresa_id = ?").run(turma_id, c.req.param('id'), c.get('user').empresa_id);
        }
      }

      await db.prepare(`
        UPDATE alunos SET 
          nome = ?, cpf = ?, rg = ?, data_nascimento = ?, cidade_nascimento = ?, 
          cep = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, estado = ?, 
          foto = ?, nome_pai = ?, nome_mae = ?, responsavel_legal = ?, 
          telefone = ?, email = ?, problemas_saude = ?, problemas_saude_outros = ?,
          uso_medicamentos = ?, medicamentos_quais = ?, turma_id = ?, posicao_sala = ?,
          fileira = ?, assento = ?, whatsapp_responsavel = ?, email_responsavel = ?
        WHERE id = ? AND empresa_id = ?
      `).run(
        nome, cpf, rg, data_nascimento, cidade_nascimento, 
        cep, endereco, numero, bairro, cidade, estado, 
        foto, nome_pai, nome_mae, responsavel_legal, 
        telefone, email, JSON.stringify(problemas_saude), problemas_saude_outros,
        uso_medicamentos ? 1 : 0, medicamentos_quais, turma_id, posicao_sala,
        fileira, assento, whatsapp_responsavel, email_responsavel, c.req.param('id'), c.get('user').empresa_id
      );
      return c.json({ success: true });
    });

    app.delete('/api/alunos/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      await db.prepare("DELETE FROM alunos WHERE id = ? AND empresa_id = ?").run(c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.delete('/api/cursos/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      await db.prepare("DELETE FROM cursos WHERE id = ? AND empresa_id = ?").run(c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.delete('/api/disciplinas/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      await db.prepare("DELETE FROM disciplinas WHERE id = ? AND empresa_id = ?").run(c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.delete('/api/turmas/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      await db.prepare("DELETE FROM turmas WHERE id = ? AND empresa_id = ?").run(c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.post('/api/system/reset-db', auth, async (c) => {
      if (!c.get('user').super_admin) {
        return c.json({ error: 'Acesso negado' }, 403);
      }
      const db = new DBWrapper(c.env.DB);
      const tables = [
        'usuarios', 'empresas', 'cursos', 'disciplinas', 'turmas', 
        'alunos', 'matriculas', 'notas', 'frequencias', 
        'historico_remanejamentos', 'financeiro', 'comunicados', 
        'comunicados_lidos', 'solicitacoes_documentos', 'solicitacoes_financeiras',
        'funcionarios', 'permissoes', 'professor_vinculos', 'professores'
      ];
      
      for (const table of tables) {
        await db.exec(`DROP TABLE IF EXISTS ${table}`);
      }
      
      return c.json({ success: true, message: 'Banco de dados resetado. Recarregue a página para reinicializar o esquema.' });
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

      const data = await c.req.json();
      const { nome, tipo_avaliacao } = data;
      const carga_horaria = toInt(data.carga_horaria);
      const curso_id = toInt(data.curso_id);

      const result = await db.prepare("INSERT INTO disciplinas (nome, carga_horaria, curso_id, tipo_avaliacao, empresa_id) VALUES (?, ?, ?, ?, ?)").run(nome, carga_horaria, curso_id, tipo_avaliacao || 'nota', c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.post('/api/disciplinas/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const data = await c.req.json();
      const { nome, tipo_avaliacao } = data;
      const carga_horaria = toInt(data.carga_horaria);
      const curso_id = toInt(data.curso_id);

      await db.prepare("UPDATE disciplinas SET nome = ?, carga_horaria = ?, curso_id = ?, tipo_avaliacao = ? WHERE id = ? AND empresa_id = ?").run(nome, carga_horaria, curso_id, tipo_avaliacao || 'nota', c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.post('/api/turmas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const data = await c.req.json();
      const { nome, turno } = data;
      const capacidade = toInt(data.capacidade);
      const ano_letivo = toInt(data.ano_letivo);
      const curso_id = toInt(data.curso_id);

      const result = await db.prepare("INSERT INTO turmas (nome, turno, capacidade, ano_letivo, curso_id, empresa_id) VALUES (?, ?, ?, ?, ?, ?)").run(nome, turno, capacidade, ano_letivo, curso_id, c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.post('/api/turmas/:id', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const data = await c.req.json();
      const { nome, turno } = data;
      const capacidade = toInt(data.capacidade);
      const ano_letivo = toInt(data.ano_letivo);
      const curso_id = toInt(data.curso_id);

      await db.prepare("UPDATE turmas SET nome = ?, turno = ?, capacidade = ?, ano_letivo = ?, curso_id = ? WHERE id = ? AND empresa_id = ?").run(nome, turno, capacidade, ano_letivo, curso_id, c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    app.post('/api/matriculas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const data = await c.req.json();
      const aluno_id = toInt(data.aluno_id);
      const turma_id = toInt(data.turma_id);

      const data_matricula = new Date().toISOString().split('T')[0];
      const result = await db.prepare("INSERT INTO matriculas (aluno_id, turma_id, data_matricula, empresa_id) VALUES (?, ?, ?, ?)").run(aluno_id, turma_id, data_matricula, c.get('user').empresa_id);
      
      // Update student's turma_id as well
      await db.prepare("UPDATE alunos SET turma_id = ? WHERE id = ? AND empresa_id = ?").run(turma_id, aluno_id, c.get('user').empresa_id);
      
      return c.json({ id: result.lastInsertRowid });
    });

    app.get('/api/configuracoes', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const row = await db.prepare("SELECT * FROM empresas WHERE id = ?").get(c.get('user').empresa_id);
      return c.json(row);
    });

    app.post('/api/configuracoes', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const { nome, cnpj, endereco, telefone, email, diretor, secretario, msg_cobranca_whatsapp, msg_cobranca_email } = await c.req.json();
      await db.prepare(`
        UPDATE empresas SET 
          nome = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, 
          diretor = ?, secretario = ?, msg_cobranca_whatsapp = ?, msg_cobranca_email = ? 
        WHERE id = ?
      `).run(nome, cnpj, endereco, telefone, email, diretor, secretario, msg_cobranca_whatsapp, msg_cobranca_email, c.get('user').empresa_id);
      return c.json({ success: true });
    });

    // Pedagogical Endpoints
    app.post('/api/notas', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const data = await c.req.json();
      const { conceito, observacao } = data;
      const aluno_id = toInt(data.aluno_id);
      const disciplina_id = toInt(data.disciplina_id);
      const turma_id = toInt(data.turma_id);
      const bimestre = toInt(data.bimestre);
      const valor = data.valor ? parseFloat(data.valor) : null;

      const result = await db.prepare("INSERT INTO notas (aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao, c.get('user').empresa_id);
      return c.json({ id: result.lastInsertRowid });
    });

    app.post('/api/notas-coletivas', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const { turma_id, disciplina_id, bimestre, notas } = await c.req.json();
      
      for (const nota of notas) {
        // Check if exists to update or insert
        const existing = await db.prepare(`
          SELECT id FROM notas 
          WHERE aluno_id = ? AND disciplina_id = ? AND bimestre = ? AND empresa_id = ?
        `).get(nota.aluno_id, disciplina_id, bimestre, c.get('user').empresa_id) as any;

        if (existing) {
          await db.prepare(`
            UPDATE notas SET valor = ?, conceito = ?, observacao = ? 
            WHERE id = ?
          `).run(nota.valor, nota.conceito, nota.observacao, existing.id);
        } else {
          await db.prepare(`
            INSERT INTO notas (aluno_id, disciplina_id, turma_id, bimestre, valor, conceito, observacao, empresa_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(nota.aluno_id, disciplina_id, turma_id, bimestre, nota.valor, nota.conceito, nota.observacao, c.get('user').empresa_id);
        }
      }
      return c.json({ success: true });
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

    app.get('/api/frequencia-stats/:turmaId/:disciplinaId', auth, async (c) => {
      const { turmaId, disciplinaId } = c.req.param();
      const db = new DBWrapper(c.env.DB);
      const user = c.get('user');
      const empresa_id = user.empresa_id;
      
      console.log(`Fetching stats for turma ${turmaId}, disciplina ${disciplinaId}, empresa ${empresa_id}`);
      
      const stats = await db.prepare(`
        SELECT 
          aluno_id,
          COUNT(CASE WHEN status = 'P' THEN 1 END) as presencas,
          COUNT(CASE WHEN status = 'FJ' THEN 1 END) as justificadas,
          COUNT(CASE WHEN status = 'F' THEN 1 END) as ausencias,
          COUNT(*) as total
        FROM frequencias
        WHERE turma_id = ? AND disciplina_id = ? AND empresa_id = ?
        GROUP BY aluno_id
      `).all(toInt(turmaId), toInt(disciplinaId), empresa_id);
      
      const statsMap: any = {};
      if (Array.isArray(stats)) {
        stats.forEach((s: any) => {
          const perc = s.total > 0 ? ((s.presencas + s.justificadas) / s.total) * 100 : 100;
          statsMap[s.aluno_id] = {
            presencas: s.presencas,
            ausencias: s.ausencias,
            justificadas: s.justificadas,
            percentual: perc.toFixed(1)
          };
        });
      }
      
      return c.json(statsMap);
    });

    app.post('/api/frequencia-coletiva', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const { turma_id, disciplina_id, data, frequencias } = await c.req.json();
      const empresa_id = c.get('user').empresa_id;
      
      console.log(`Saving collective frequency for turma ${turma_id}, disciplina ${disciplina_id}, date ${data}`);
      
      for (const freq of frequencias) {
        const aluno_id = toInt(freq.aluno_id);
        const disc_id = toInt(disciplina_id);
        const t_id = toInt(turma_id);

        const existing = await db.prepare(`
          SELECT id FROM frequencias 
          WHERE aluno_id = ? AND disciplina_id = ? AND data = ? AND empresa_id = ?
        `).get(aluno_id, disc_id, data, empresa_id) as any;

        if (existing) {
          await db.prepare(`
            UPDATE frequencias SET status = ?, justificativa = ? 
            WHERE id = ?
          `).run(freq.status, freq.justificativa || '', existing.id);
        } else {
          await db.prepare(`
            INSERT INTO frequencias (aluno_id, disciplina_id, turma_id, data, status, justificativa, empresa_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(aluno_id, disc_id, t_id, data, freq.status, freq.justificativa || '', empresa_id);
        }
      }
      return c.json({ success: true });
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

    app.get('/api/notas-turma/:turmaId/:disciplinaId/:bimestre', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const rows = await db.prepare(`
        SELECT * FROM notas 
        WHERE turma_id = ? AND disciplina_id = ? AND bimestre = ? AND empresa_id = ?
      `).all(c.req.param('turmaId'), c.req.param('disciplinaId'), c.req.param('bimestre'), c.get('user').empresa_id);
      return c.json(rows);
    });

    app.get('/api/frequencia-turma/:turmaId/:disciplinaId/:data', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const rows = await db.prepare(`
        SELECT * FROM frequencias 
        WHERE turma_id = ? AND disciplina_id = ? AND data = ? AND empresa_id = ?
      `).all(c.req.param('turmaId'), c.req.param('disciplinaId'), c.req.param('data'), c.get('user').empresa_id);
      return c.json(rows);
    });

    app.get('/api/frequencia-mensal/:turmaId/:disciplinaId/:mes/:ano', auth, async (c) => {
      const { turmaId, disciplinaId, mes, ano } = c.req.param();
      const db = new DBWrapper(c.env.DB);
      const empresa_id = c.get('user').empresa_id;
      
      const startDate = `${ano}-${mes.padStart(2, '0')}-01`;
      const endDate = `${ano}-${mes.padStart(2, '0')}-31`; // Simplified, SQLite handles date strings well
      
      const rows = await db.prepare(`
        SELECT * FROM frequencias 
        WHERE turma_id = ? AND disciplina_id = ? AND empresa_id = ?
        AND data BETWEEN ? AND ?
      `).all(toInt(turmaId), toInt(disciplinaId), empresa_id, startDate, endDate);
      
      return c.json(rows);
    });

    // Financial Endpoints
    app.get('/api/financeiro', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const rows = await db.prepare(`
        SELECT f.*, a.nome as aluno_nome, a.whatsapp_responsavel as aluno_telefone, a.email_responsavel as aluno_email, a.responsavel_legal, a.nome_mae 
        FROM financeiro f 
        JOIN alunos a ON f.aluno_id = a.id 
        WHERE f.empresa_id = ?`).all(c.get('user').empresa_id);
      return c.json(rows);
    });

    app.post('/api/financeiro', auth, async (c) => {
  const db = new DBWrapper(c.env.DB);

      const data = await c.req.json();
      const { status, descricao, vencimento } = data;
      const aluno_id = toInt(data.aluno_id);
      const valor = data.valor ? parseFloat(data.valor) : 0;

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

    app.get('/api/portal-aluno/:alunoId', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const alunoId = c.req.param('alunoId');
      const empresaId = c.get('user').empresa_id;

      const [notas, frequencia, financeiro] = await Promise.all([
        db.prepare(`
          SELECT d.nome as disciplina, AVG(n.valor) as media
          FROM notas n
          JOIN disciplinas d ON n.disciplina_id = d.id
          WHERE n.aluno_id = ? AND n.empresa_id = ?
          GROUP BY d.id
        `).all(alunoId, empresaId),
        db.prepare(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'presente' THEN 1 ELSE 0 END) as presencas
          FROM frequencias
          WHERE aluno_id = ? AND empresa_id = ?
        `).get(alunoId, empresaId),
        db.prepare(`
          SELECT descricao, valor, status, vencimento
          FROM financeiro
          WHERE aluno_id = ? AND empresa_id = ?
          ORDER BY vencimento DESC
        `).all(alunoId, empresaId)
      ]);

      const percentualFrequencia = frequencia.total > 0 ? (frequencia.presencas / frequencia.total) * 100 : 100;

      return c.json({
        notas,
        frequencia: { percentual: percentualFrequencia },
        financeiro
      });
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
    app.get('/api/solicitacoes-financeiras', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const aluno_id = c.req.query('aluno_id');
      let query = `
        SELECT s.*, a.nome as aluno_nome, f.descricao as financeiro_descricao 
        FROM solicitacoes_financeiras s 
        JOIN alunos a ON s.aluno_id = a.id 
        LEFT JOIN financeiro f ON s.financeiro_id = f.id
        WHERE s.empresa_id = ?
      `;
      const params: any[] = [c.get('user').empresa_id];
      if (aluno_id) {
        query += " AND s.aluno_id = ?";
        params.push(aluno_id);
      }
      const rows = await db.prepare(query).all(...params);
      return c.json(rows);
    });

    app.post('/api/solicitacoes-financeiras', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const { aluno_id, financeiro_id, observacao } = await c.req.json();
      const data = new Date().toISOString();
      await db.prepare("INSERT INTO solicitacoes_financeiras (empresa_id, aluno_id, financeiro_id, data_solicitacao, observacao) VALUES (?, ?, ?, ?, ?)").run(c.get('user').empresa_id, aluno_id, financeiro_id || null, data, observacao);
      return c.json({ success: true });
    });

    app.put('/api/solicitacoes-financeiras/:id', auth, async (c) => {
      const db = new DBWrapper(c.env.DB);
      const { status } = await c.req.json();
      await db.prepare("UPDATE solicitacoes_financeiras SET status = ? WHERE id = ? AND empresa_id = ?").run(status, c.req.param('id'), c.get('user').empresa_id);
      return c.json({ success: true });
    });

    
export default app;
