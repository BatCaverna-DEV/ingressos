import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Evento = sequelize.define('eventos', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  descricao: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  inicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fim: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '1=ativo, 0=inativo',
  },
});

export default Evento;
