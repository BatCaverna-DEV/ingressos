import jwt from 'jsonwebtoken';
import { erro } from './resposta.js';

export const gerarToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return erro(res, 'Token não informado', 401);

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return erro(res, 'Token inválido ou expirado', 403);
    req.usuario = usuario;
    next();
  });
};
