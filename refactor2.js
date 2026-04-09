import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf-8');

// Remove all imports
code = code.replace(/import .* from '.*';\n/g, '');

// Add new imports
const newImports = `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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

`;

// Extract the API routes
const routesStart = code.indexOf("app.get('/api/health'");
const routesEnd = code.indexOf("// Vite middleware for development");
let routesCode = code.substring(routesStart, routesEnd);

// Replace route handlers
routesCode = routesCode.replace(/app\.(get|post|put|delete)\('([^']+)',\s*(?:auth,\s*)?\(req(?:: any)?,\s*res(?:: any)?\)\s*=>\s*\{/g, (match, method, path) => {
  const isAuth = match.includes('auth,');
  return `app.${method}('${path}', ${isAuth ? 'auth, ' : ''}async (c) => {\n  const db = new DBWrapper(c.env.DB);\n`;
});

// Replace req.body, req.params, req.query
routesCode = routesCode.replace(/const (\{[^}]+\}) = req\.body;/g, "const $1 = await c.req.json();");
routesCode = routesCode.replace(/req\.body/g, "(await c.req.json())");
routesCode = routesCode.replace(/req\.params\.([a-zA-Z0-9_]+)/g, "c.req.param('$1')");
routesCode = routesCode.replace(/req\.query\.([a-zA-Z0-9_]+)/g, "c.req.query('$1')");

// Replace req.user
routesCode = routesCode.replace(/req\.user/g, "c.get('user')");

// Replace res.json
routesCode = routesCode.replace(/res\.json\((.*)\);/g, "return c.json($1);");
routesCode = routesCode.replace(/res\.status\((\d+)\)\.json\((.*)\);/g, "return c.json($2, $1);");

// Replace db.prepare
routesCode = routesCode.replace(/db\.prepare\(([^)]+)\)\.(get|all|run)\(([^)]*)\)/g, "await db.prepare($1).$2($3)");

// Fix download-db
routesCode = routesCode.replace(/const dbPath = path\.join\(__dirname, 'database\.db'\);\n\s*res\.download\(dbPath, 'database\.db'\);/, "return c.json({ error: 'Download DB não suportado no Cloudflare' }, 400);");

// Add init-db route
const initDbRoute = `
app.post('/api/init-db', async (c) => {
  const db = new DBWrapper(c.env.DB);
  try {
    // Schema creation
    await db.exec(\`
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
    \`);

    // Seed initial data
    const empresaCount = await db.prepare("SELECT count(*) as count FROM empresas").get() as any;
    if (empresaCount.count === 0) {
      await db.prepare("INSERT INTO empresas (nome, cnpj, endereco, telefone, email, diretor, secretario, plano) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run("Escola EduManager", "00.000.000/0001-00", "Rua das Flores, 123 - Centro", "(11) 99999-9999", "contato@edumanager.com", "Dr. Roberto Silva", "Maria Oliveira", "Premium");
      const hash = bcrypt.hashSync('123', 10);
      await db.prepare("INSERT INTO usuarios (empresa_id, nome, email, senha, perfil) VALUES (?, ?, ?, ?, ?)").run(1, 'Admin', 'admin@admin.com', hash, 'admin');
      
      // Academic Seed
      await db.prepare("INSERT INTO cursos (empresa_id, nome, descricao) VALUES (?, ?, ?)").run(1, 'Ensino Fundamental II', '6º ao 9º ano');
      await db.prepare("INSERT INTO disciplinas (empresa_id, curso_id, nome, carga_horaria) VALUES (?, ?, ?, ?)").run(1, 1, 'Matemática', 80);
      await db.prepare("INSERT INTO disciplinas (empresa_id, curso_id, nome, carga_horaria) VALUES (?, ?, ?, ?)").run(1, 1, 'Português', 80);
      await db.prepare("INSERT INTO turmas (empresa_id, curso_id, nome, turno, capacidade, ano_letivo) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, '6º Ano A', 'Manhã', 30, 2026);
      
      // Student Seed
      await db.prepare("INSERT INTO alunos (empresa_id, nome, cpf, status) VALUES (?, ?, ?, ?)").run(1, "João Silva", "123.456.789-00", 'ativo');
      await db.prepare("INSERT INTO usuarios (empresa_id, aluno_id, nome, email, senha, perfil) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'João Silva', 'aluno@aluno.com', hash, 'aluno');
      await db.prepare("INSERT INTO matriculas (empresa_id, aluno_id, turma_id, data_matricula) VALUES (?, ?, ?, ?)").run(1, 1, 1, '2026-01-15');
      
      // Finance Seed
      await db.prepare("INSERT INTO financeiro (empresa_id, aluno_id, descricao, valor, vencimento, status) VALUES (?, ?, ?, ?, ?, ?)").run(1, 1, 'Mensalidade Março', 450.00, '2026-03-10', 'pendente');
      
      // Communication Seed
      await db.prepare("INSERT INTO comunicados (empresa_id, titulo, conteudo, data_postagem, alvo) VALUES (?, ?, ?, ?, ?)").run(1, 'Início das Aulas', 'As aulas começam dia 10 de Fevereiro.', '2026-02-01', 'todos');
    }

    return c.json({ success: true, message: 'Banco de dados inicializado com sucesso!' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
`;

const finalCode = newImports + initDbRoute + routesCode + "\nexport default app;\n";

fs.writeFileSync('src/worker.ts', finalCode);
