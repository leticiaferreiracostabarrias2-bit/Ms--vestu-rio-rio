import { Router } from 'express';
import usuarioRoutes from './usuarioRoutes';

const router = Router();

router.use('/usuarios', usuarioRoutes); // Tiramos o /api daqui

export default router;