import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Comissao = sequelize.define('comissoes', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  categoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '1=organizador, 2=voluntário, 3=palestrante',
  },
  usuarios_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  eventos_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

export default Comissao;
