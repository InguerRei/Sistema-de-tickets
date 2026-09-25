const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, 'database', 'sistema_tickets.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('erro ao conectar no banco:', err.message);
        return;
    }
    console.log('conectado ao SQLite3');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'usuario e senha sao obrigatorios!.' });
  }

  const sql = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';

  db.get(sql, [username, password], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'error ao consultar o banco' });
    }

    if (!row) {
      return res.status(401).json({ message: 'credenciais invalidas' });
    }

    return res.json({
      success: true,
      message: 'Login realizado.',
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});