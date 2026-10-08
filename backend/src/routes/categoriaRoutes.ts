import { Router } from 'express';
import { CategoriaController } from '../controllers/categoriaController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), CategoriaController.criar);
router.get('/', autenticarToken, CategoriaController.listarAtivas);

export default router;