import { Router } from 'express';
import { ProdutoController } from '../controllers/produtoController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), ProdutoController.criar);
router.get('/', autenticarToken, ProdutoController.listarTodos);
router.get('/barcode/:codigoBarras', autenticarToken, ProdutoController.buscarPorCodigoBarras);

export default router;