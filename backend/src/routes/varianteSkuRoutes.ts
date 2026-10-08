import { Router } from 'express';
import { VarianteSkuController } from '../controllers/varianteSkuController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VarianteSkuController.criar);
router.patch('/:id/estoque', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VarianteSkuController.atualizarEstoque);

export default router;