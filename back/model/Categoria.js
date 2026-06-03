import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Categoria = sequelize.define('categorias', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  descricao: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '1=ativo, 0=inativo',
  },
});

export default Categoria;
