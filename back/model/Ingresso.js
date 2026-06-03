import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Ingresso = sequelize.define('ingressos', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  codigo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  descricao: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '1=disponível, 2=usado, 0=cancelado',
  },
  qrcode: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categorias_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  eventos_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

export default Ingresso;
