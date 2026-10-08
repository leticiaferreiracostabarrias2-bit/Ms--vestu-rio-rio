import { Request, Response } from 'express';
import { CategoriaModel } from '../models/categoriaModel';

export class CategoriaController {
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, descricao, ativo } = req.body;

      if (!nome) {
        return res.status(400).json({ mensagem: 'Nome da categoria é obrigatório.' });
      }

      const idCategoria = await CategoriaModel.criar({ nome, descricao, ativo });
      return res.status(201).json({ mensagem: 'Categoria criada com sucesso.', idCategoria });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao criar categoria.', erro });
    }
  }

  static async listarAtivas(_req: Request, res: Response): Promise<Response> {
    try {
      const categorias = await CategoriaModel.buscarTodasAtivas();
      return res.status(200).json(categorias);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao listar categorias.', erro });
    }
  }
}