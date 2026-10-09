import { Request, Response } from 'express';
import { VarianteSkuModel } from '../models/varianteSkuModel';

export class VarianteSkuController {
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { sku, codigoBarras, tamanho, cor, precoVenda, quantidadeEstoque, produtoId } = req.body;

      if (!sku || !tamanho || !cor || precoVenda === undefined || !produtoId) {
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
        quantidadeEstoque: quantidadeEstoque ?? 0,
        quantidadeReservada: 0,
        produtoId
      });

      return res.status(201).json({ mensagem: 'Variante cadastrada com sucesso.', idVarianteSku });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao criar variante SKU.', erro });
    }
  }

  static async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const idNum = Number(id);

      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de variante inválido.' });
      }

      const variante = await VarianteSkuModel.buscarPorId(idNum);
      if (!variante) {
        return res.status(404).json({ mensagem: 'Variante SKU não encontrada.' });
      }

      return res.status(200).json(variante);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao buscar variante SKU.', erro });
    }
  }

static async buscarPorSku(req: Request, res: Response): Promise<Response> {
  try {
    const { sku } = req.params;

    // Garante a conversão e estreitamento de tipo para string pura
    const skuString = Array.isArray(sku) ? sku[0] : (sku as string);

    if (!skuString) {
      return res.status(400).json({ mensagem: 'O código SKU é obrigatório.' });
    }

    const variante = await VarianteSkuModel.buscarPorSku(skuString);
    if (!variante) {
      return res.status(404).json({ mensagem: 'SKU não encontrado.' });
    }

    return res.status(200).json(variante);
  } catch (erro) {
    return res.status(500).json({ mensagem: 'Erro interno ao buscar por SKU.', erro });
  }
}

  static async listarTodas(_req: Request, res: Response): Promise<Response> {
    try {
      const variantes = await VarianteSkuModel.buscarTodas();
      return res.status(200).json(variantes);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao listar variantes SKU.', erro });
    }
  }

  static async atualizarEstoque(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { novaQuantidade } = req.body;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de variante inválido.' });
      }

      if (novaQuantidade === undefined || novaQuantidade < 0) {
        return res.status(400).json({ mensagem: 'Quantidade de estoque inválida.' });
      }

      const atualizado = await VarianteSkuModel.atualizarEstoque(idNum, novaQuantidade);
      if (!atualizado) {
        return res.status(404).json({ mensagem: 'Variante SKU não encontrada.' });
      }

      return res.status(200).json({ mensagem: 'Estoque atualizado com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao atualizar estoque.', erro });
    }
  }

  static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { sku, codigoBarras, tamanho, cor, precoVenda, quantidadeEstoque, quantidadeReservada, produtoId } = req.body;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de variante inválido.' });
      }

      const varianteExistente = await VarianteSkuModel.buscarPorId(idNum);
      if (!varianteExistente) {
        return res.status(404).json({ mensagem: 'Variante SKU não encontrada.' });
      }

      if (sku && sku !== varianteExistente.sku) {
        const skuEmUso = await VarianteSkuModel.buscarPorSku(sku);
        if (skuEmUso) {
          return res.status(409).json({ mensagem: 'Este código SKU já está em uso por outra variante.' });
        }
      }

      await VarianteSkuModel.atualizar(idNum, {
        sku,
        codigoBarras,
        tamanho,
        cor,
        precoVenda,
        quantidadeEstoque,
        quantidadeReservada,
        produtoId
      });

      return res.status(200).json({ mensagem: 'Variante SKU atualizada com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao atualizar variante SKU.', erro });
    }
  }

  static async excluir(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de variante inválido.' });
      }

      const varianteExistente = await VarianteSkuModel.buscarPorId(idNum);
      if (!varianteExistente) {
        return res.status(404).json({ mensagem: 'Variante SKU não encontrada.' });
      }

      await VarianteSkuModel.excluir(idNum);
      return res.status(200).json({ mensagem: 'Variante SKU excluída com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao excluir variante SKU.', erro });
    }
  }
}