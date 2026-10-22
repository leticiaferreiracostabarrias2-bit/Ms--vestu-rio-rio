import { Request, Response } from 'express';
import { ClienteModel } from '../models/clienteModel';

export class ClienteController {
  /**
   * Cadastra um novo cliente na base de dados (Apenas o nome é obrigatório)
   */
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, cpfCnpj, telefone, email } = req.body;

      // Validação do campo obrigatório Nome
      if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ mensagem: 'O nome do cliente é obrigatório.' });
      }

      // Se CPF/CNPJ for informado, verifica duplicidade no banco
      if (cpfCnpj) {
        const clienteExistente = await ClienteModel.buscarPorCpfCnpj(cpfCnpj);
        if (clienteExistente) {
          return res.status(409).json({ mensagem: 'Já existe um cliente cadastrado com este CPF/CNPJ.' });
        }
      }

      // Criação do registro do cliente sem senha
      const idCliente = await ClienteModel.criar({
        nome: nome.trim(),
        cpfCnpj,
        telefone,
        email,
      });
      return res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso.', idCliente });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao cadastrar cliente.', erro });
    }
  }

  /**
   * Busca um cliente pelo CPF/CNPJ
   */
  static async buscarPorCpfCnpj(req: Request, res: Response): Promise<Response> {
    try {
      const { cpfCnpj } = req.params;
      const cpfCnpjString = Array.isArray(cpfCnpj) ? cpfCnpj[0] : (cpfCnpj as string);

      if (!cpfCnpjString) {
        return res.status(400).json({ mensagem: 'O CPF/CNPJ é obrigatório.' });
      }

      const cliente = await ClienteModel.buscarPorCpfCnpj(cpfCnpjString);

      if (!cliente) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
      }

      return res.status(200).json(cliente);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao buscar cliente.', erro });
    }
  }

  /**
   * Listagem de todos os clientes cadastrados
   */
  static async listarTodos(_req: Request, res: Response): Promise<Response> {
    try {
      const clientes = await ClienteModel.buscarTodos();
      return res.status(200).json(clientes);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao listar clientes.', erro });
    }
  }

  /**
   * Atualiza as informações do cliente pelo ID (sem checagem de senha)
   */
  static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, cpfCnpj, telefone, email } = req.body;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de cliente inválido.' });
      }

      const clienteExistente = await ClienteModel.buscarPorId(idNum);
      if (!clienteExistente) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
      }

      // Se alterou CPF/CNPJ, checa se não pertence a outro cliente
      if (cpfCnpj && cpfCnpj !== clienteExistente.cpfCnpj) {
        const cpfEmUso = await ClienteModel.buscarPorCpfCnpj(cpfCnpj);
        if (cpfEmUso) {
          return res.status(409).json({ mensagem: 'Este CPF/CNPJ já está cadastrado para outro cliente.' });
        }
      }

      await ClienteModel.atualizar(idNum, {
        nome,
        cpfCnpj,
        telefone,
        email
      });

      return res.status(200).json({ mensagem: 'Dados do cliente atualizados com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao atualizar cliente.', erro });
    }
  }

  /**
   * Exclui o cadastro do cliente pelo ID
   */
  static async excluir(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de cliente inválido.' });
      }

      const clienteExistente = await ClienteModel.buscarPorId(idNum);
      if (!clienteExistente) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
      }

      await ClienteModel.excluir(idNum);
      return res.status(200).json({ mensagem: 'Cadastro do cliente excluído com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao excluir cliente.', erro });
    }
  }
}