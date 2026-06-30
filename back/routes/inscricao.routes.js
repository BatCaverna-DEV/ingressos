import { Router } from 'express';
import { listar, buscar, criar, deferir, indeferir, remover } from '../controller/InscricaoController.js';
import { verificarToken } from '../helpers/auth.js';

const router = Router();

router.get('/', verificarToken, listar);
router.get('/:id', verificarToken, buscar);
router.post('/', verificarToken, criar);
router.patch('/:id/deferir', verificarToken, deferir);
router.patch('/:id/indeferir', verificarToken, indeferir);
router.delete('/:id', verificarToken, remover);

export default router;
