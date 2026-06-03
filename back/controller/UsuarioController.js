import { OAuth2Client } from 'google-auth-library';
import { Usuario } from '../model/index.js';
import { gerarToken } from '../helpers/auth.js';
import { sucesso, erro } from '../helpers/resposta.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return erro(res, 'Token do Google não informado', 400);

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    let usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      usuario = await Usuario.create({
        nome: name,
        email,
        categoria: 3,
        status: 'ativo',
      });
    }

    if (usuario.status !== 'ativo') return erro(res, 'Usuário inativo', 403);

    const token = gerarToken({ id: usuario.id, email: usuario.email, categoria: usuario.categoria });
    return sucesso(res, {
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, categoria: usuario.categoria },
    }, 'Login realizado');
  } catch (e) {
    return erro(res, 'Token do Google inválido', 401, e.message);
  }
};

export const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ attributes: { exclude: ['senha'] } });
    return sucesso(res, usuarios);
  } catch (e) {
    return erro(res, 'Erro ao listar usuários', 500, e.message);
  }
};

export const buscar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, { attributes: { exclude: ['senha'] } });
    if (!usuario) return erro(res, 'Usuário não encontrado', 404);
    return sucesso(res, usuario);
  } catch (e) {
    return erro(res, 'Erro ao buscar usuário', 500, e.message);
  }
};

export const criar = async (req, res) => {
  try {
    const { nome, email, categoria, status } = req.body;
    const usuario = await Usuario.create({ nome, email, categoria, status: status || 'ativo' });
    return sucesso(res, usuario, 'Usuário criado', 201);
  } catch (e) {
    return erro(res, 'Erro ao criar usuário', 500, e.message);
  }
};

export const atualizar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return erro(res, 'Usuário não encontrado', 404);
    const { nome, email, categoria, status } = req.body;
    await usuario.update({ nome, email, categoria, status });
    return sucesso(res, usuario, 'Usuário atualizado');
  } catch (e) {
    return erro(res, 'Erro ao atualizar usuário', 500, e.message);
  }
};

export const remover = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return erro(res, 'Usuário não encontrado', 404);
    await usuario.update({ status: 'inativo' });
    return sucesso(res, null, 'Usuário desativado');
  } catch (e) {
    return erro(res, 'Erro ao remover usuário', 500, e.message);
  }
};
