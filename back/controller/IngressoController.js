import QRCode from 'qrcode';
import { Ingresso, Evento, Categoria } from '../model/index.js';
import { sucesso, erro } from '../helpers/resposta.js';

const gerarCodigo = () =>
  `ING-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

export const listar = async (req, res) => {
  try {
    const { eventos_id } = req.query;
    const where = eventos_id ? { eventos_id } : {};
    const ingressos = await Ingresso.findAll({
      where,
      include: [{ model: Evento, as: 'evento' }, { model: Categoria, as: 'categoria' }],
    });
    return sucesso(res, ingressos);
  } catch (e) {
    return erro(res, 'Erro ao listar ingressos', 500, e.message);
  }
};

export const buscar = async (req, res) => {
  try {
    const ingresso = await Ingresso.findByPk(req.params.id, {
      include: [{ model: Evento, as: 'evento' }, { model: Categoria, as: 'categoria' }],
    });
    if (!ingresso) return erro(res, 'Ingresso não encontrado', 404);
    return sucesso(res, ingresso);
  } catch (e) {
    return erro(res, 'Erro ao buscar ingresso', 500, e.message);
  }
};

export const buscarPorCodigo = async (req, res) => {
  try {
    const ingresso = await Ingresso.findOne({
      where: { codigo: req.params.codigo },
      include: [{ model: Evento, as: 'evento' }, { model: Categoria, as: 'categoria' }],
    });
    if (!ingresso) return erro(res, 'Ingresso não encontrado', 404);
    return sucesso(res, ingresso);
  } catch (e) {
    return erro(res, 'Erro ao buscar ingresso por código', 500, e.message);
  }
};

export const criar = async (req, res) => {
  try {
    const { descricao, categorias_id, eventos_id, quantidade = 1 } = req.body;
    const qty = Math.min(Math.max(parseInt(quantidade) || 1, 1), 100);

    const ingressos = await Promise.all(
      Array.from({ length: qty }, async () => {
        const codigo = gerarCodigo();
        const qrcode = await QRCode.toDataURL(codigo);
        return Ingresso.create({ codigo, descricao, status: 1, qrcode, categorias_id, eventos_id });
      })
    );

    return sucesso(res, ingressos, `${qty} ingresso(s) criado(s)`, 201);
  } catch (e) {
    return erro(res, 'Erro ao criar ingresso', 500, e.message);
  }
};

export const validar = async (req, res) => {
  try {
    const ingresso = await Ingresso.findOne({ where: { codigo: req.params.codigo } });
    if (!ingresso) return erro(res, 'Ingresso não encontrado', 404);
    if (ingresso.status === 2) return erro(res, 'Ingresso já utilizado', 400);
    if (ingresso.status === 0) return erro(res, 'Ingresso cancelado', 400);
    await ingresso.update({ status: 2 });
    return sucesso(res, ingresso, 'Ingresso validado com sucesso');
  } catch (e) {
    return erro(res, 'Erro ao validar ingresso', 500, e.message);
  }
};

export const remover = async (req, res) => {
  try {
    const ingresso = await Ingresso.findByPk(req.params.id);
    if (!ingresso) return erro(res, 'Ingresso não encontrado', 404);
    await ingresso.update({ status: 0 });
    return sucesso(res, null, 'Ingresso cancelado');
  } catch (e) {
    return erro(res, 'Erro ao cancelar ingresso', 500, e.message);
  }
};
