import { Router } from 'express';
import { VendaController } from '../controllers/vendaController';
import { autenticarToken, autorizarCargos } from '../middlewares/authMiddleware';

const router = Router();

// Processar Venda no Caixa (Acessível a qualquer usuário autenticado)
router.post('/', autenticarToken, VendaController.processarVenda);

// Consultar Histórico Geral de Vendas
router.get('/', autenticarToken, VendaController.listarVendas);

// Relatório da Curva ABC / Mais Vendidos (Exclusivo para GERENTE e ADMIN)
router.get('/relatorios/mais-vendidos', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VendaController.relatorioMaisVendidos);

// Histórico Detalhado de Compras por Cliente
router.get('/cliente/:clienteId', autenticarToken, VendaController.listarPorCliente);

// Consultar Venda Específica por ID
router.get('/:id', autenticarToken, VendaController.buscarPorId);

// Cancelar/Estornar Venda (Exclusivo para GERENTE e ADMIN)
router.patch('/:id/cancelar', autenticarToken, autorizarCargos(['GERENTE', 'ADMIN']), VendaController.cancelarVenda);

export default router;