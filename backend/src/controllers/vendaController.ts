import { Request, Response } from 'express';
import { VendaService } from '../services/vendaService';
import { ItemVendaModel } from '../models/itemVendaModel';
import { db } from '../config/database';
import { CriarVendaDTO } from '../types';

export class VendaController {
  static async processarVenda(req: Request, res: Response): Promise<Response> {
    try {
      const dadosVenda: CriarVendaDTO = req.body;

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