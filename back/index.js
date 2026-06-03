import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { sequelize } from './model/index.js';

import usuarioRoutes from './routes/usuario.routes.js';
import eventoRoutes from './routes/evento.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import ingressoRoutes from './routes/ingresso.routes.js';
import comissaoRoutes from './routes/comissao.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/ingressos', ingressoRoutes);
app.use('/api/comissoes', comissaoRoutes);

app.get('/', (req, res) => res.json({ mensagem: 'API Ingressos IFMA - Coelho Neto' }));

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('Banco de dados conectado.');
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados.');
    app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
  } catch (e) {
    console.error('Erro ao iniciar servidor:', e.message);
    process.exit(1);
  }
};

iniciar();
