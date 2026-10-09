import { Router } from 'express';
import { VarianteSkuController } from '../controllers/varianteSkuController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint para criação de variante SKU (Restrito a GERENTE e ADMIN)
router.post('/', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VarianteSkuController.criar);

// Listagem de todas as variantes SKU
router.get('/', autenticarToken, VarianteSkuController.listarTodas);

// Consulta por ID
router.get('/:id', autenticarToken, VarianteSkuController.buscarPorId);

// Consulta por SKU
router.get('/sku/:sku', autenticarToken, VarianteSkuController.buscarPorSku);

// Atualização rápida de estoque (Restrito a GERENTE e ADMIN)
router.patch('/:id/estoque', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VarianteSkuController.atualizarEstoque);

// Atualização cadastral completa da variante (Restrito a GERENTE e ADMIN)
router.put('/:id', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VarianteSkuController.atualizar);

// Exclusão de variante SKU (Restrito a GERENTE e ADMIN)
router.delete('/:id', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VarianteSkuController.excluir);

export default router;