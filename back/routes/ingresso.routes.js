import { Router } from 'express';
import { listar, buscar, buscarPorCodigo, criar, validar, remover } from '../controller/IngressoController.js';
import { verificarToken } from '../helpers/auth.js';

const router = Router();

router.get('/', verificarToken, listar);
router.get('/codigo/:codigo', buscar);
router.get('/:id', verificarToken, buscarPorCodigo);
router.post('/', verificarToken, criar);
router.patch('/validar/:codigo', verificarToken, validar);
router.delete('/:id', verificarToken, remover);

export default router;
