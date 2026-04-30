require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// String de conexão com MongoDB Atlas usando variáveis de ambiente
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_CLUSTER = process.env.DB_CLUSTER;
const DB_NAME = process.env.DB_NAME;

// Verificar se todas as variáveis necessárias estão definidas
if (!DB_USERNAME || !DB_PASSWORD || !DB_CLUSTER || !DB_NAME) {
  console.error('❌ Erro: Variáveis de ambiente do MongoDB não configuradas corretamente');
  console.error('Certifique-se de que .env contém: DB_USERNAME, DB_PASSWORD, DB_CLUSTER, DB_NAME');
  process.exit(1);
}

const CONNECTION_STRING = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_CLUSTER}/${DB_NAME}`;

// Schema do usuário
const userSchema = new mongoose.Schema({
  nome: String,
  email: String,
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

// Model do usuário
const User = mongoose.model('Utilizadores', userSchema);

// Rota para criar um usuário
app.post('/registrar', async (req, res) => {
  try {
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

// Rota para listar todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await User.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Conexão com MongoDB Atlas
mongoose.connect(CONNECTION_STRING)
.then(() => {
  console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
  
  // Iniciar o servidor apenas após conectar ao banco
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📝 Endpoint para registrar usuário: POST http://localhost:${PORT}/registrar`);
    console.log(`📋 Endpoint para listar usuários: GET http://localhost:${PORT}/usuarios`);
  });
})
.catch((error) => {
  console.error('❌ Erro ao conectar ao MongoDB Atlas:', error.message);
  process.exit(1);
});
