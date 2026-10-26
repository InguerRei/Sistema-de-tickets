const express = require('express');
const sqlite3 = requere('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Permite requisições do navegador durante o desenvolvimento local.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
next();
});

//Permite ler JSON Enviado pelo frontend y servir os archivos do projeto.
app.use(express.json());
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, 'database', 'sistema_tickets.db');
const db = new sqlite3.Database(dbPath, err=> {
  if(err){
    console.error('Erro ao conectar no banco', err.message);
    return;
  }

  //o SQlite precisa disso para verificar chaves estrangeiras
  db.run('ORAGMA foreing_key = ON');
  console.log('Conectado ao SQLite3');
});

//verifica as credenciais na tabela de usuarios
app.post('/login', (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Usuarios e senha son obligatorios'
    });
  }

  const sql = `
  SELECT id, username, email, role
  FROM usuarios
  WHERE username = ? password = ?
  `;

  db.get(sql, [username, password], (err, user) => {
    if(err){
      console.error(err);
      return res.status(500).json({
        message: 'Erro ao consultar o banco.'
      });
    }

    if (!user){
      return res.status(401).json({
        message: 'Credenciais invalidas'
      });
    }

    return res.json({
      success: true,
      message: 'Login Realizado.',
      user
    });
  });
});

// Busca os chamados para o dashboard.
app.get('/tickets', (req, res) => {
  const sql = `
    SELECT id, title, description, category, status, user_id, created_at
    FROM tickets
    ORDER BY created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Erro ao buscar chamados.'
      });
    }

    return res.json(rows);
  });
});

// Recebe os dados do formulário e cria um chamado.
app.post('/tickets', (req, res) => {
  const { title, description, category, user_id } = req.body;
  const userId = Number(user_id);

  if (
    typeof title !== 'string' || !title.trim() ||
    typeof description !== 'string' || !description.trim() ||
    typeof category !== 'string' || !category.trim()
  ) {
    return res.status(400).json({
      message: 'Título, descrição e categoria são obrigatórios.'
    });
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      message: 'É necessário informar um ID de usuário válido.'
    });
  }

  const sql = `
    INSERT INTO tickets (title, description, category, user_id, status)
    VALUES (?, ?, ?, ?, 'aberto')
  `;

  db.run(
    sql,
    [title.trim(), description.trim(), category.trim(), userId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: 'Erro ao criar chamado.'
        });
      }

      return res.status(201).json({
        message: 'Chamado criado com sucesso.',
        id: this.lastID
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});