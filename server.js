// server.js - NOVO FICHEIRO PARA A VERCEL
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Schema do usuário
const userSchema = new mongoose.Schema({
  nome: String,
  email: String,
  dataCriacao: { type: Date, default: Date.now }
});

const User = mongoose.model('Utilizadores', userSchema);

// Middleware para conectar ao MongoDB (com pooling)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('📦 Usando conexão existente');
    return cachedDb;
  }
  
  console.log('🔌 Conectando ao MongoDB...');
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = conn;
  console.log('✅ Conectado ao MongoDB');
  return cachedDb;
}

// Rotas
app.post('/registrar', async (req, res) => {
  try {
    await connectToDatabase();
    const { nome, email } = req.body;
    
    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }
    
    const novoUsuario = new User({ nome, email });
    await novoUsuario.save();
    
    res.status(201).json({ 
      mensagem: 'Usuário registrado com sucesso!',
      usuario: novoUsuario 
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    await connectToDatabase();
    const usuarios = await User.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/', async (req, res) => {
  res.send("<h1> Seja bem Vindo ao meu software em produção ... </h1>")
});
// Exportar para a Vercel (NÃO usar app.listen)
module.exports = app;
