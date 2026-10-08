import { Request, Response } from 'express';
import { ClienteModel } from '../models/clienteModel';

export class ClienteController {
    static async criar(req: Request, res: Response): Promise<Response> {
        try {
            const { nome, cpfCnpj, telefone, email } = req.body;

            if (!nome || typeof nome !== 'string' || nome.trim() === '') {
                return res.status(400).json({ mensagem: 'O nome do cliente é obrigatório.' });
            }

            if (cpfCnpj) {
                const clienteExistente = await ClienteModel.buscarPorCpfCnpj(cpfCnpj);
                if (clienteExistente) {
                    return res.status(409).json({ mensagem: 'Já existe um cliente cadastrado com este CPF/CNPJ.' });
                }
            }

            const idCliente = await ClienteModel.criar({ nome, cpfCnpj, telefone, email });
            return res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso.', idCliente });
        } catch (erro) {
            return res.status(500).json({ mensagem: 'Erro interno ao cadastrar cliente.', erro });
        }
    }

    static async buscarPorCpfCnpj(req: Request, res: Response): Promise<Response> {
        try {
            const { cpfCnpj } = req.params;

            // Garantimos a conversão/tipagem estrita para string
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

    static async listarTodos(_req: Request, res: Response): Promise<Response> {
        try {
            const clientes = await ClienteModel.buscarTodos();
            return res.status(200).json(clientes);
        } catch (erro) {
            return res.status(500).json({ mensagem: 'Erro interno ao listar clientes.', erro });
        }
    }
}