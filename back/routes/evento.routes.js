import { Router } from 'express';
import { listar, buscar, criar, atualizar, remover } from '../controller/EventoController.js';
import { verificarToken } from '../helpers/auth.js';

const router = Router();

router.get('/', listar);
router.get('/:id', buscar);
router.post('/', verificarToken, criar);
router.put('/:id', verificarToken, atualizar);
router.delete('/:id', verificarToken, remover);

export default router;
