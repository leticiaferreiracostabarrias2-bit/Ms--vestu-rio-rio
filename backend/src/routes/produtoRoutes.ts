import { Router } from 'express';
import { ProdutoController } from '../controllers/produtoController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint de cadastro de produto (Restrito a GERENTE e ADMIN)
router.post('/', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), ProdutoController.criar);

// Listagem de produtos
router.get('/', autenticarToken, ProdutoController.listarTodos);

// Consulta por código de barras de variante SKU
router.get('/barcode/:codigoBarras', autenticarToken, ProdutoController.buscarPorCodigoBarras);

// Consulta individual por ID
router.get('/:id', autenticarToken, ProdutoController.buscarPorId);

// Atualização de produto (Restrito a GERENTE e ADMIN)
router.put('/:id', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), ProdutoController.atualizar);

// Exclusão de produto (Restrito a GERENTE e ADMIN)
router.delete('/:id', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), ProdutoController.excluir);

export default router;