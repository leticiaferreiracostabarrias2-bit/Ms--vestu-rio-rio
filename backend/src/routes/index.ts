import { Router } from 'express';
import clienteRoutes from './clienteRoutes';
import produtoRoutes from './produtoRoutes';
import vendaRoutes from './vendaRoutes';
import usuarioRoutes from './usuarioRoutes';
import categoriaRoutes from './categoriaRoutes';
import varianteSkuRoutes from './varianteSkuRoutes';

const routes = Router();

/**
 * Ponto centralizador de roteamento da API REST
 */
routes.use('/usuarios', usuarioRoutes);
routes.use('/clientes', clienteRoutes);
routes.use('/categorias', categoriaRoutes);
routes.use('/produtos', produtoRoutes);
routes.use('/variantes', varianteSkuRoutes);
routes.use('/vendas', vendaRoutes);

export default routes;