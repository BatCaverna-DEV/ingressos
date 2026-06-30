import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Inscricao = sequelize.define('inscricoes', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  usuarios_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  eventos_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  categorias_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '0=pendente, 1=deferida, 2=indeferida',
  },
});

export default Inscricao;
