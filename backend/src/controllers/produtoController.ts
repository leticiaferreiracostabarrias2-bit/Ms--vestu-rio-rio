import { Request, Response } from 'express';
import { VarianteSkuModel } from '../models/varianteSkuModel';
import { ProdutoModel } from '../models/produtoModel';

export class ProdutoController {
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, precoBase, ativo, categoriaId } = req.body;

      if (!nome || precoBase === undefined || !categoriaId) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios do produto ausentes.' });
      }

      const idProduto = await ProdutoModel.criar({ nome, precoBase, ativo, categoriaId });
      return res.status(201).json({ mensagem: 'Produto cadastrado com sucesso.', idProduto });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao criar produto.', erro });
    }
  }

  static async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const idNum = Number(id);

      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de produto inválido.' });
      }

      const produto = await ProdutoModel.buscarPorId(idNum);
      if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
      }

      return res.status(200).json(produto);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao buscar produto.', erro });
    }
  }

  static async buscarPorCodigoBarras(req: Request, res: Response): Promise<Response> {
    try {
      const codigoBarrasParam = req.params.codigoBarras;
      const codigoBarras = Array.isArray(codigoBarrasParam) ? codigoBarrasParam[0] : codigoBarrasParam;

      if (!codigoBarras) {
        return res.status(400).json({ mensagem: 'Código de barras é obrigatório.' });
      }

      const item = await VarianteSkuModel.buscarPorCodigoBarras(codigoBarras);

      if (!item) {
        return res.status(404).json({ mensagem: 'Produto/SKU não encontrado ou inativo.' });
      }

      return res.status(200).json(item);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao consultar código de barras.', erro });
    }
  }

  static async listarTodos(_req: Request, res: Response): Promise<Response> {
    try {
      const produtos = await ProdutoModel.buscarTodos();
      return res.status(200).json(produtos);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao listar produtos.', erro });
    }
  }

  static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, precoBase, ativo, categoriaId } = req.body;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de produto inválido.' });
      }

      const produtoExistente = await ProdutoModel.buscarPorId(idNum);
      if (!produtoExistente) {
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
      }

      await ProdutoModel.atualizar(idNum, { nome, precoBase, ativo, categoriaId });
      return res.status(200).json({ mensagem: 'Produto atualizado com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao atualizar produto.', erro });
    }
  }

  static async excluir(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de produto inválido.' });
      }

      const produtoExistente = await ProdutoModel.buscarPorId(idNum);
      if (!produtoExistente) {
        return res.status(404).json({ mensagem: 'Produto não encontrado.' });
      }

      await ProdutoModel.excluir(idNum);
      return res.status(200).json({ mensagem: 'Produto excluído com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao excluir produto.', erro });
    }
  }
}