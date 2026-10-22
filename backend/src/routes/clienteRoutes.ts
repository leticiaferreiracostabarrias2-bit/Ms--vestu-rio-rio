import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';
import { autenticarToken } from '../middlewares/authMiddleware';

const router = Router();

// ==========================================
// ROTAS PRIVADAS E PROTEGIDAS (Exigem Token JWT)
// ==========================================

// Cadastro de cliente diretamente pelo caixa ou painel (Não exige senha)
router.post('/', autenticarToken, ClienteController.criar);

// Listagem de clientes da loja
router.get('/', autenticarToken, ClienteController.listarTodos);

// Consulta individual por CPF/CNPJ
router.get('/cpf/:cpfCnpj', autenticarToken, ClienteController.buscarPorCpfCnpj);

// Atualização de dados cadastrais do cliente
router.put('/:id', autenticarToken, ClienteController.atualizar);

// Exclusão de cadastro do cliente pelo ID
router.delete('/:id', autenticarToken, ClienteController.excluir);

export default router;