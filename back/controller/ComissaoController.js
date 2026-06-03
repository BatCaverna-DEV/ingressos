import { Comissao, Usuario, Evento } from '../model/index.js';
import { sucesso, erro } from '../helpers/resposta.js';

export const listar = async (req, res) => {
  try {
    const { eventos_id } = req.query;
    const where = eventos_id ? { eventos_id } : {};
    const comissoes = await Comissao.findAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: { exclude: ['senha'] } }, { model: Evento, as: 'evento' }],
    });
    return sucesso(res, comissoes);
  } catch (e) {
    return erro(res, 'Erro ao listar comissões', 500, e.message);
  }
};

export const criar = async (req, res) => {
  try {
    const { categoria, usuarios_id, eventos_id } = req.body;
    const comissao = await Comissao.create({ categoria, usuarios_id, eventos_id });
    return sucesso(res, comissao, 'Membro adicionado à comissão', 201);
  } catch (e) {
    return erro(res, 'Erro ao criar comissão', 500, e.message);
  }
};

export const remover = async (req, res) => {
  try {
    const comissao = await Comissao.findByPk(req.params.id);
    if (!comissao) return erro(res, 'Registro não encontrado', 404);
    await comissao.destroy();
    return sucesso(res, null, 'Membro removido da comissão');
  } catch (e) {
    return erro(res, 'Erro ao remover da comissão', 500, e.message);
  }
};
