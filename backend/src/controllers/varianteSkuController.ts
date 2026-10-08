import { Request, Response } from 'express';
import { VarianteSkuModel } from '../models/varianteSkuModel';

export class VarianteSkuController {
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { sku, codigoBarras, tamanho, cor, precoVenda, quantidadeEstoque, produtoId } = req.body;

      if (!sku || !tamanho || !cor || !precoVenda || !produtoId) {
        return res.status(400).json({ mensagem: 'Dados incompletos para a variante/SKU.' });
      }

      const skuExistente = await VarianteSkuModel.buscarPorSku(sku);
      if (skuExistente) {
        return res.status(409).json({ mensagem: 'SKU já cadastrado no sistema.' });
      }

      const idVarianteSku = await VarianteSkuModel.criar({
        sku,
        codigoBarras,
        tamanho,
        cor,
        precoVenda,
        quantidadeEstoque,
        quantidadeReservada: 0,
        produtoId
      });

      return res.status(201).json({ mensagem: 'Variante cadastrada com sucesso.', idVarianteSku });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao criar variante SKU.', erro });
    }
  }

  static async atualizarEstoque(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { novaQuantidade } = req.body;

      if (novaQuantidade === undefined || novaQuantidade < 0) {
        return res.status(400).json({ mensagem: 'Quantidade de estoque inválida.' });
      }

      const atualizado = await VarianteSkuModel.atualizarEstoque(Number(id), novaQuantidade);
      if (!atualizado) {
        return res.status(404).json({ mensagem: 'Variante SKU não encontrada.' });
      }

      return res.status(200).json({ mensagem: 'Estoque atualizado com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao atualizar estoque.', erro });
    }
  }
}