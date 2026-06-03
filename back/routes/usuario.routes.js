import { Router } from 'express';
import { loginGoogle, listar, buscar, criar, atualizar, remover } from '../controller/UsuarioController.js';
import { verificarToken } from '../helpers/auth.js';

const router = Router();

router.post('/login/google', loginGoogle);
router.get('/', verificarToken, listar);
router.get('/:id', verificarToken, buscar);
router.post('/', verificarToken, criar);
router.put('/:id', verificarToken, atualizar);
router.delete('/:id', verificarToken, remover);

export default router;
