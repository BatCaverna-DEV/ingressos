import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Usuario = sequelize.define('usuarios', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  matricula: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  categoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '1=admin, 2=operador, 3=visitante',
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '1=ativo, 0=inativo',
  },
});

export default Usuario;
