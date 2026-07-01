import { Router } from 'express';
import { loginGoogle, registrar, listar, buscar, criar, atualizar, remover, excluir } from '../controller/UsuarioController.js';
import { verificarToken } from '../helpers/auth.js';

const router = Router();

router.post('/login/google', loginGoogle);
router.post('/registrar', registrar);
router.get('/', verificarToken, listar);
router.get('/:id', verificarToken, buscar);
router.post('/', verificarToken, criar);
router.put('/:id', verificarToken, atualizar);
router.delete('/:id', verificarToken, remover);
router.delete('/:id/excluir', verificarToken, excluir);

export default router;
