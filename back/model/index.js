import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Evento from './Evento.js';
import Categoria from './Categoria.js';
import Ingresso from './Ingresso.js';
import Comissao from './Comissao.js';

// Evento <-> Ingresso
Evento.hasMany(Ingresso, { foreignKey: 'eventos_id', as: 'ingressos' });
Ingresso.belongsTo(Evento, { foreignKey: 'eventos_id', as: 'evento' });

// Categoria <-> Ingresso
Categoria.hasMany(Ingresso, { foreignKey: 'categorias_id', as: 'ingressos' });
Ingresso.belongsTo(Categoria, { foreignKey: 'categorias_id', as: 'categoria' });

// Usuario <-> Comissao
Usuario.hasMany(Comissao, { foreignKey: 'usuarios_id', as: 'comissoes' });
Comissao.belongsTo(Usuario, { foreignKey: 'usuarios_id', as: 'usuario' });

// Evento <-> Comissao
Evento.hasMany(Comissao, { foreignKey: 'eventos_id', as: 'comissoes' });
Comissao.belongsTo(Evento, { foreignKey: 'eventos_id', as: 'evento' });

export { sequelize, Usuario, Evento, Categoria, Ingresso, Comissao };
