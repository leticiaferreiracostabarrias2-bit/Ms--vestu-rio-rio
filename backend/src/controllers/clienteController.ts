import { Request, Response } from 'express';
import { ClienteModel } from '../models/clienteModel';

export class ClienteController {
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, cpfCnpj, telefone, email, senha } = req.body;

      if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ mensagem: 'O nome do cliente é obrigatório.' });
      }

      if (!senha) {
        return res.status(400).json({ mensagem: 'A senha é obrigatória para cadastrar a conta do cliente.' });
      }

      if (cpfCnpj) {
        const clienteExistente = await ClienteModel.buscarPorCpfCnpj(cpfCnpj);
        if (clienteExistente) {
          return res.status(409).json({ mensagem: 'Já existe um cliente cadastrado com este CPF/CNPJ.' });
        }
      }

      const idCliente = await ClienteModel.criar({ nome, cpfCnpj, telefone, email, senha });
      return res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso.', idCliente });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao cadastrar cliente.', erro });
    }
  }

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

      // Omite a senha no retorno de busca pública/interna
      const { senha, ...clienteSemSenha } = cliente;
      return res.status(200).json(clienteSemSenha);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao buscar cliente.', erro });
    }
  }

  static async listarTodos(_req: Request, res: Response): Promise<Response> {
    try {
      const clientes = await ClienteModel.buscarTodos();
      return res.status(200).json(clientes);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao listar clientes.', erro });
    }
  }

  /**
   * Atualiza as informações do cliente somente se a senha fornecida for válida
   */
  static async atualizar(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, cpfCnpj, telefone, email, senhaAtual, novaSenha } = req.body;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de cliente inválido.' });
      }

      if (!senhaAtual) {
        return res.status(400).json({ mensagem: 'A senha atual é obrigatória para atualizar os dados da conta.' });
      }

      const clienteExistente = await ClienteModel.buscarPorId(idNum);
      if (!clienteExistente) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
      }

      // Confirmação de segurança: compara a senha enviada com a armazenada
      if (clienteExistente.senha !== senhaAtual) {
        return res.status(401).json({ mensagem: 'Senha incorreta. Não foi possível atualizar os dados do cliente.' });
      }

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
        email,
        senha: novaSenha || undefined
      });

      return res.status(200).json({ mensagem: 'Dados do cliente atualizados com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao atualizar cliente.', erro });
    }
  }

  /**
   * Exclui a conta do cliente mediante validação de senha
   */
  static async excluir(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { senhaAtual } = req.body;

      const idNum = Number(id);
      if (isNaN(idNum)) {
        return res.status(400).json({ mensagem: 'ID de cliente inválido.' });
      }

      if (!senhaAtual) {
        return res.status(400).json({ mensagem: 'A senha é obrigatória para confirmar a exclusão da conta.' });
      }

      const clienteExistente = await ClienteModel.buscarPorId(idNum);
      if (!clienteExistente) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
      }

      // Confirmação de segurança por senha
      if (clienteExistente.senha !== senhaAtual) {
        return res.status(401).json({ mensagem: 'Senha incorreta. A exclusão da conta foi negada.' });
      }

      await ClienteModel.excluir(idNum);
      return res.status(200).json({ mensagem: 'Conta do cliente excluída com sucesso.' });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao excluir cliente.', erro });
    }
  }
}