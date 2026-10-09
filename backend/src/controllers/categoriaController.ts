import { Request, Response } from 'express';
import { CategoriaModel } from '../models/categoriaModel';

export class CategoriaController {
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, descricao, ativo } = req.body;

      if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ mensagem: 'Nome da categoria é obrigatório.' });
      }

      const categoriaExistente = await CategoriaModel.buscarPorNome(nome.trim());
      if (categoriaExistente) {
        return res.status(409).json({ mensagem: 'Já existe uma categoria cadastrada com este nome.' });
      }

      const idCategoria = await CategoriaModel.criar({ 
        nome: nome.trim(), 
        descricao, 
        ativo: ativo ?? true 
      });

      return res.status(201).json({ mensagem: 'Categoria criada com sucesso.', idCategoria });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao criar categoria.', erro });
    }
  }

  static async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const idNum = Number(id);

      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de categoria inválido.' });
      }

      const categoria = await CategoriaModel.buscarPorId(idNum);
      if (!categoria) {
        return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
      }

      return res.status(200).json(categoria);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao buscar categoria.', erro });
    }
  }

  static async listarAtivas(_req: Request, res: Response): Promise<Response> {
    try {
      const categorias = await CategoriaModel.buscarTodasAtivas();
      return res.status(200).json(categorias);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao listar categorias ativas.', erro });
    }
  }

  static async listarTodas(_req: Request, res: Response): Promise<Response> {
    try {
      const categorias = await CategoriaModel.buscarTodas();
      return res.status(200).json(categorias);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao listar todas as categorias.', erro });
    }
  }

  static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, descricao, ativo } = req.body;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de categoria inválido.' });
      }

      const categoriaExistente = await CategoriaModel.buscarPorId(idNum);
      if (!categoriaExistente) {
        return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
      }

      if (nome && nome !== categoriaExistente.nome) {
        const nomeEmUso = await CategoriaModel.buscarPorNome(nome.trim());
        if (nomeEmUso) {
          return res.status(409).json({ mensagem: 'Já existe outra categoria cadastrada com este nome.' });
        }
      }

      await CategoriaModel.atualizar(idNum, {
        nome: nome ? nome.trim() : undefined,
        descricao,
        ativo
      });

      return res.status(200).json({ mensagem: 'Categoria atualizada com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao atualizar categoria.', erro });
    }
  }

  static async excluir(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de categoria inválido.' });
      }

      const categoriaExistente = await CategoriaModel.buscarPorId(idNum);
      if (!categoriaExistente) {
        return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
      }

      await CategoriaModel.excluir(idNum);
      return res.status(200).json({ mensagem: 'Categoria excluída com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao excluir categoria.', erro });
    }
  }
}