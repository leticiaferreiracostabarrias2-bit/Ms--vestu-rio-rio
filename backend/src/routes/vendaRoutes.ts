import { Router } from 'express';
import { VendaController } from '../controllers/vendaController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', autenticarToken, VendaController.processarVenda);
router.get('/relatorios/mais-vendidos', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VendaController.relatorioMaisVendidos);

export default router;