import { Categoria } from '../model/index.js';
import { sucesso, erro } from '../helpers/resposta.js';

export const listar = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({ where: { status: 1 } });
    return sucesso(res, categorias);
  } catch (e) {
    return erro(res, 'Erro ao listar categorias', 500, e.message);
  }
};

export const buscar = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return erro(res, 'Categoria não encontrada', 404);
    return sucesso(res, categoria);
  } catch (e) {
    return erro(res, 'Erro ao buscar categoria', 500, e.message);
  }
};

export const criar = async (req, res) => {
  try {
    const { descricao, status } = req.body;
    const categoria = await Categoria.create({ descricao, status: status ?? 1 });
    return sucesso(res, categoria, 'Categoria criada', 201);
  } catch (e) {
    return erro(res, 'Erro ao criar categoria', 500, e.message);
  }
};

export const atualizar = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return erro(res, 'Categoria não encontrada', 404);
    await categoria.update(req.body);
    return sucesso(res, categoria, 'Categoria atualizada');
  } catch (e) {
    return erro(res, 'Erro ao atualizar categoria', 500, e.message);
  }
};

export const remover = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) return erro(res, 'Categoria não encontrada', 404);
    await categoria.update({ status: 0 });
    return sucesso(res, null, 'Categoria desativada');
  } catch (e) {
    return erro(res, 'Erro ao remover categoria', 500, e.message);
  }
};
