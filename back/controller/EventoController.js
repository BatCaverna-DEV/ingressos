import { Evento, Ingresso, Comissao } from '../model/index.js';
import { sucesso, erro } from '../helpers/resposta.js';

export const listar = async (req, res) => {
  try {
    const eventos = await Evento.findAll();
    return sucesso(res, eventos);
  } catch (e) {
    return erro(res, 'Erro ao listar eventos', 500, e.message);
  }
};

export const buscar = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id, {
      include: [{ model: Ingresso, as: 'ingressos' }, { model: Comissao, as: 'comissoes' }],
    });
    if (!evento) return erro(res, 'Evento não encontrado', 404);
    return sucesso(res, evento);
  } catch (e) {
    return erro(res, 'Erro ao buscar evento', 500, e.message);
  }
};

export const criar = async (req, res) => {
  try {
    const { descricao, inicio, fim, status } = req.body;
    const evento = await Evento.create({ descricao, inicio, fim, status: status ?? 1 });
    return sucesso(res, evento, 'Evento criado', 201);
  } catch (e) {
    return erro(res, 'Erro ao criar evento', 500, e.message);
  }
};

export const atualizar = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return erro(res, 'Evento não encontrado', 404);
    await evento.update(req.body);
    return sucesso(res, evento, 'Evento atualizado');
  } catch (e) {
    return erro(res, 'Erro ao atualizar evento', 500, e.message);
  }
};

export const remover = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return erro(res, 'Evento não encontrado', 404);
    await evento.update({ status: 0 });
    return sucesso(res, null, 'Evento desativado');
  } catch (e) {
    return erro(res, 'Erro ao remover evento', 500, e.message);
  }
};
