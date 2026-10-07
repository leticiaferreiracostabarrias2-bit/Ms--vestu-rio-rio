import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rotas Públicas
router.post('/', UsuarioController.criar);
router.post('/login', UsuarioController.login);

// Rotas Protegidas (Exigem Token JWT)
// Isolamento de dados: cada usuário acessa unicamente seus próprios dados
router.post('/logout', authMiddleware, UsuarioController.logout as any);

export default router;
