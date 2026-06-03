import 'dotenv/config';
import { createConnection } from 'mariadb';
import sequelize from './database.js';
import '../model/index.js';
import { Categoria, Evento } from '../model/index.js';

const criarDatabase = async () => {
  const conn = await createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`✔ Banco "${process.env.DB_NAME}" criado (ou já existia).`);
  await conn.end();
};

const sincronizarTabelas = async () => {
  await sequelize.authenticate();
  console.log('✔ Conexão com o banco estabelecida.');
  await sequelize.sync({ force: true });
  console.log('✔ Tabelas criadas com sucesso.');
};

const inserirDadosIniciais = async () => {
  const categorias = ['Estudante', 'Professor', 'Servidor', 'Visitante', 'Palestrante'];
  for (const descricao of categorias) {
    await Categoria.create({ descricao, status: 1 });
  }
  console.log(`✔ ${categorias.length} categorias inseridas: ${categorias.join(', ')}`);

  const agora = new Date();
  const fim = new Date(agora.getTime() + 8 * 60 * 60 * 1000);
  await Evento.create({
    descricao: 'Semana de Tecnologia IFMA 2025',
    inicio: agora,
    fim,
    status: 1,
  });
  console.log('✔ Evento de exemplo criado.');
};

const main = async () => {
  try {
    console.log('\n=== Criação do Banco de Dados ===\n');
    await criarDatabase();
    await sincronizarTabelas();
    await inserirDadosIniciais();
    console.log('\n✅ Banco pronto! Execute "npm run dev" para iniciar o servidor.\n');
  } catch (e) {
    console.error('\n❌ Erro:', e.message);
    if (e.original) console.error('   Detalhe:', e.original.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();
