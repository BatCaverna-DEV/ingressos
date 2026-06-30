import QRCode from 'qrcode';
import { Inscricao, Ingresso, Evento, Usuario, Categoria } from '../model/index.js';
import { sucesso, erro } from '../helpers/resposta.js';

const CATEGORIA_NOME = { 2: 'Estudante', 3: 'Externo' };

export const listar = async (req, res) => {
  try {
    const { eventos_id, usuarios_id } = req.query;
    const where = {};
    if (eventos_id) where.eventos_id = eventos_id;
    if (usuarios_id) where.usuarios_id = usuarios_id;

    const inscricoes = await Inscricao.findAll({
      where,
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Evento, as: 'evento', attributes: ['id', 'descricao'] },
        { model: Categoria, as: 'categoria', attributes: ['id', 'descricao'] },
        { model: Ingresso, as: 'ingressos', attributes: ['id', 'codigo', 'status', 'qrcode'] },
      ],
    });
    return sucesso(res, inscricoes);
  } catch (e) {
    return erro(res, 'Erro ao listar inscrições', 500, e.message);
  }
};

export const buscar = async (req, res) => {
  try {
    const inscricao = await Inscricao.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Evento, as: 'evento' },
        { model: Categoria, as: 'categoria' },
        { model: Ingresso, as: 'ingressos' },
      ],
    });
    if (!inscricao) return erro(res, 'Inscrição não encontrada', 404);
    return sucesso(res, inscricao);
  } catch (e) {
    return erro(res, 'Erro ao buscar inscrição', 500, e.message);
  }
};

export const criar = async (req, res) => {
  try {
    const { eventos_id } = req.body;
    const usuarios_id = req.usuario.id;

    const usuario = await Usuario.findByPk(usuarios_id);
    if (!usuario) return erro(res, 'Usuário não encontrado', 404);

    const nomeCategoria = CATEGORIA_NOME[usuario.categoria];
    if (!nomeCategoria) return erro(res, 'Seu perfil não permite inscrição direta em eventos', 403);

    const [categoria] = await Categoria.findOrCreate({
      where: { descricao: nomeCategoria },
      defaults: { descricao: nomeCategoria, status: 1 },
    });

    const evento = await Evento.findByPk(eventos_id);
    if (!evento) return erro(res, 'Evento não encontrado', 404);
    if (evento.status !== 1) return erro(res, 'Evento inativo', 400);

    const jaInscrito = await Inscricao.findOne({ where: { usuarios_id, eventos_id } });
    if (jaInscrito) return erro(res, 'Você já possui uma inscrição neste evento', 409);

    const precisaValidacao = usuario.categoria === 3;
    const inscricao = await Inscricao.create({ usuarios_id, eventos_id, categorias_id: categoria.id, status: precisaValidacao ? 0 : 1 });

    if (!precisaValidacao) {
      const quantidade = usuario.categoria === 2 ? 2 : (evento.quantidade || 1);
      const ingressos = await Promise.all(
        Array.from({ length: quantidade }, async () => {
          const codigo = `ING-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          const qrcode = await QRCode.toDataURL(codigo);
          return Ingresso.create({ codigo, status: 1, qrcode, categorias_id: categoria.id, eventos_id, usuarios_id, inscricoes_id: inscricao.id });
        })
      );
      return sucesso(res, { inscricao, ingressos }, `Inscrição confirmada! ${quantidade} ingresso(s) emitido(s).`, 201);
    }

    return sucesso(res, { inscricao }, 'Inscrição realizada! Aguarde a validação pelo administrador.', 201);
  } catch (e) {
    return erro(res, 'Erro ao realizar inscrição', 500, e.message);
  }
};

export const deferir = async (req, res) => {
  try {
    const inscricao = await Inscricao.findByPk(req.params.id);
    if (!inscricao) return erro(res, 'Inscrição não encontrada', 404);
    if (inscricao.status === 1) return erro(res, 'Inscrição já deferida', 400);

    await inscricao.update({ status: 1 });

    const evento = await Evento.findByPk(inscricao.eventos_id);
    const quantidade = evento?.quantidade || 1;
    const ingressos = await Promise.all(
      Array.from({ length: quantidade }, async () => {
        const codigo = `ING-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const qrcode = await QRCode.toDataURL(codigo);
        return Ingresso.create({
          codigo, status: 1, qrcode,
          categorias_id: inscricao.categorias_id,
          eventos_id: inscricao.eventos_id,
          usuarios_id: inscricao.usuarios_id,
          inscricoes_id: inscricao.id,
        });
      })
    );

    return sucesso(res, { inscricao, ingressos }, `Inscrição deferida! ${quantidade} ingresso(s) emitido(s).`);
  } catch (e) {
    return erro(res, 'Erro ao deferir inscrição', 500, e.message);
  }
};

export const indeferir = async (req, res) => {
  try {
    const inscricao = await Inscricao.findByPk(req.params.id);
    if (!inscricao) return erro(res, 'Inscrição não encontrada', 404);
    await inscricao.update({ status: 2 });
    return sucesso(res, inscricao, 'Inscrição indeferida.');
  } catch (e) {
    return erro(res, 'Erro ao indeferir inscrição', 500, e.message);
  }
};

export const remover = async (req, res) => {
  try {
    const inscricao = await Inscricao.findByPk(req.params.id);
    if (!inscricao) return erro(res, 'Inscrição não encontrada', 404);

    const isAdmin = req.usuario?.categoria === 1;
    if (!isAdmin && inscricao.status === 1)
      return erro(res, 'Inscrição já confirmada. Somente o administrador pode cancelá-la.', 403);

    await Ingresso.update({ status: 0 }, { where: { inscricoes_id: inscricao.id } });
    await inscricao.destroy();
    return sucesso(res, null, 'Inscrição cancelada');
  } catch (e) {
    return erro(res, 'Erro ao cancelar inscrição', 500, e.message);
  }
};
