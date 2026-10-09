import { Router } from 'express';
import { CategoriaController } from '../controllers/categoriaController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint de criação de categoria (Restrito a GERENTE e ADMIN)
router.post('/', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), CategoriaController.criar);

// Listagem de categorias ativas (Acesso geral para operadores autenticados)
router.get('/', autenticarToken, CategoriaController.listarAtivas);

// Listagem de todas as categorias, incluindo inativas (Restrito a GERENTE e ADMIN)
router.get('/todas', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), CategoriaController.listarTodas);

// Consulta individual de categoria por ID
router.get('/:id', autenticarToken, CategoriaController.buscarPorId);

// Atualização de categoria (Restrito a GERENTE e ADMIN)
router.put('/:id', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), CategoriaController.atualizar);

// Exclusão de categoria (Restrito a GERENTE e ADMIN)
router.delete('/:id', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), CategoriaController.excluir);

export default router;