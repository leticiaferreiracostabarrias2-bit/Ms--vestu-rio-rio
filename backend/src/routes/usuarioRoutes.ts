import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

// ==========================================
// ENDPOINTS PÚBLICOS (Sem necessidade de JWT)
// ==========================================

// Endpoint de autenticação
router.post('/login', UsuarioController.login);

// Endpoint de cadastro aberto (público)
router.post('/', UsuarioController.criar);

// ==========================================
// ENDPOINTS PROTEGIDOS (Exigem Token JWT)
// ==========================================

// Encerramento de sessão
router.post('/logout', autenticarToken, UsuarioController.logout);

// Listagem restrita apenas a Gerentes e Admins
router.get('/', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), UsuarioController.listarTodos);

// Atualização de usuário por ID (Exige envio da senhaAtual no body)
router.put('/:id', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), UsuarioController.atualizar);

// Exclusão de usuário por ID (Restrito EXCLUSIVAMENTE a GERENTE e ADMIN)
router.delete('/:id', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), UsuarioController.excluir);

export default router;