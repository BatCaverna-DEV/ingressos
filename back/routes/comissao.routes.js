import { Router } from 'express';
import { listar, criar, remover } from '../controller/ComissaoController.js';
import { verificarToken } from '../helpers/auth.js';

const router = Router();

router.get('/', verificarToken, listar);
router.post('/', verificarToken, criar);
router.delete('/:id', verificarToken, remover);

export default router;
