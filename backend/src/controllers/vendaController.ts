import { Request, Response } from 'express';
import { VendaService } from '../services/vendaService';
import { ItemVendaModel } from '../models/itemVendaModel';
import { db } from '../config/database';
import { CriarVendaDTO } from '../types';

export class VendaController {
  static async processarVenda(req: Request, res: Response): Promise<Response> {
    try {
      const dadosVenda: CriarVendaDTO = req.body;

      // Sobrescreve/Garante o usuarioId através do payload decodificado do Token JWT
      const usuarioLogadoId = (req as any).usuario?.id;
      if (usuarioLogadoId) {
        dadosVenda.usuarioId = usuarioLogadoId;
      }

      if (!dadosVenda.usuarioId || !dadosVenda.formaPagamento || !Array.isArray(dadosVenda.itens) || dadosVenda.itens.length === 0) {
        return res.status(400).json({ mensagem: 'Dados incompletos para processar a venda no caixa.' });
      }

      const vendaService = new VendaService(db);
      const resultado = await vendaService.processarVenda(dadosVenda);

      return res.status(201).json({
        mensagem: 'Venda realizada com sucesso!',
        idVenda: resultado.idVenda,
        valorTotal: resultado.valorTotal
      });

    } catch (erro: any) {
      return res.status(400).json({ mensagem: erro.message || 'Falha ao processar venda.' });
    }
  }

  static async listarVendas(req: Request, res: Response): Promise<Response> {
    try {
      const [vendas] = await db.execute(
        `SELECT 
           v.idvendas, 
           v.data_venda, 
           v.valor_total, 
           v.desconto, 
           v.forma_pagamento, 
           v.status,
           u.nome AS vendedor, 
           c.nome AS cliente
         FROM vendas v
         INNER JOIN usuarios u ON v.usuarios_idusuarios = u.idusuarios
         LEFT JOIN clientes c ON v.clientes_idclientes = c.idclientes
         ORDER BY v.data_venda DESC`
      );
      return res.status(200).json(vendas);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao listar histórico de vendas.', erro });
    }
  }

  /**
   * Lista o histórico detalhado de todas as compras e peças adquiridas por um cliente específico
   */
  static async listarPorCliente(req: Request, res: Response): Promise<Response> {
    try {
      const { clienteId } = req.params;

      const [compras]: any = await db.execute(
        `SELECT 
           v.idvendas AS vendaId,
           v.data_venda AS dataVenda,
           v.valor_total AS valorTotalVenda,
           v.status AS statusVenda,
           iv.quantidade,
           iv.preco_unitario AS precoUnitario,
           iv.subtotal AS subtotalItem,
           p.nome AS nomeProduto,
           vsku.sku,
           vsku.tamanho,
           vsku.cor
         FROM vendas v
         INNER JOIN itens_venda iv ON v.idvendas = iv.vendas_idvendas
         INNER JOIN variantes_sku vsku ON iv.variantes_sku_idvariantes_sku = vsku.idvariantes_sku
         INNER JOIN produtos p ON vsku.produtos_idprodutos = p.idprodutos
         WHERE v.clientes_idclientes = ?
         ORDER BY v.data_venda DESC`,
        [clienteId]
      );

      return res.status(200).json(compras);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao buscar histórico de compras do cliente.', erro });
    }
  }

  static async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const [venda]: any = await db.execute(
        `SELECT 
           v.*, 
           u.nome AS vendedor, 
           c.nome AS cliente
         FROM vendas v
         INNER JOIN usuarios u ON v.usuarios_idusuarios = u.idusuarios
         LEFT JOIN clientes c ON v.clientes_idclientes = c.idclientes
         WHERE v.idvendas = ?`,
        [id]
      );

      if (!venda || venda.length === 0) {
        return res.status(404).json({ mensagem: 'Venda não encontrada.' });
      }

      const itens = await ItemVendaModel.buscarPorVendaId(Number(id));

      return res.status(200).json({
        ...venda[0],
        itens
      });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao buscar dados da venda.', erro });
    }
  }

  static async cancelarVenda(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        return res.status(400).json({ mensagem: 'O motivo do cancelamento é obrigatório.' });
      }

      const vendaService = new VendaService(db);
      await vendaService.cancelarVenda(Number(id), motivo);

      return res.status(200).json({ mensagem: 'Venda cancelada e estoque estornado com sucesso!' });
    } catch (erro: any) {
      return res.status(400).json({ mensagem: erro.message || 'Erro ao cancelar a venda.' });
    }
  }

  static async relatorioMaisVendidos(req: Request, res: Response): Promise<Response> {
    try {
      const limite = req.query.limite ? Number(req.query.limite) : 10;
      const relatorio = await ItemVendaModel.buscarMaisVendidos(limite);
      return res.status(200).json(relatorio);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao gerar relatório da Curva ABC.', erro });
    }
  }
}