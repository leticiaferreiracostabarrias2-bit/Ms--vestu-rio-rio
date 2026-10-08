import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

// ==========================================
// ENDPOINTS PÚBLICOS (Sem necessidade de JWT)
// ==========================================

// Endpoint de autenticação
router.post('/login', UsuarioController.login);

// Endpoint de cadastro aberto (agora público)
router.post('/', UsuarioController.criar);

// ==========================================
// ENDPOINTS PROTEGIDOS (Exigem Token JWT)
// ==========================================

// Encerramento de sessão
router.post('/logout', autenticarToken, UsuarioController.logout);

// Listagem restrita apenas a Gerentes e Admins
router.get('/', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), UsuarioController.listarTodos);

export default router;