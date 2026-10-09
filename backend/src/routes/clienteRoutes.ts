import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

// ==========================================
// ROTAS PRIVADAS E PROTEGIDAS (Exigem Token JWT)
// ==========================================

// Cadastro de cliente exige operador autenticado no caixa
router.post('/', autenticarToken, ClienteController.criar);

// Listagem de clientes da loja totalmente restrita
router.get('/', autenticarToken, ClienteController.listarTodos);

// Consulta por CPF/CNPJ restrita a usuários logados no PDV
router.get('/cpf/:cpfCnpj', autenticarToken, ClienteController.buscarPorCpfCnpj);

// Atualização de dados do cliente (Requer envio de senhaAtual no body)
router.put('/:id', autenticarToken, ClienteController.atualizar);

// Exclusão de conta do cliente (Requer envio de senhaAtual no body)
router.delete('/:id', autenticarToken, ClienteController.excluir);

export default router;