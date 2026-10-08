import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/usuarioModel';

export class UsuarioController {

  /**
   * Autentica o usuário e retorna o Token JWT
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
      }

      const usuario = await UsuarioModel.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
      }

      // Validação de senha
      if (usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
      }

      const chaveSecreta = process.env.JWT_SECRET || 'chave_secreta_ms2_vestuario';
      const token = jwt.sign(
        {
          idUsuario: usuario.idUsuario,
          email: usuario.email,
          cargo: usuario.cargo
        },
        chaveSecreta,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        mensagem: 'Login efetuado com sucesso.',
        token,
        usuario: {
          idUsuario: usuario.idUsuario,
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo
        }
      });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao realizar login.', erro });
    }
  }

  /**
   * Encerra a sessão do usuário
   */
  static async logout(_req: Request, res: Response): Promise<Response> {
    return res.status(200).json({ mensagem: 'Sessão encerrada com sucesso.' });
  }

  /**
   * Cria um novo usuário no sistema
   */
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, email, senha, cargo } = req.body;

      if (!nome || !email || !senha || !cargo) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios não preenchidos.' });
      }

      const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
      }

      const idUsuario = await UsuarioModel.criar({ nome, email, senha, cargo });
      return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', idUsuario });
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro interno ao cadastrar usuário.', erro });
    }
  }

  /**
   * Lista todos os usuários
   */
  static async listarTodos(_req: Request, res: Response): Promise<Response> {
    try {
      const usuarios = await UsuarioModel.buscarTodos();
      return res.status(200).json(usuarios);
    } catch (erro) {
      return res.status(500).json({ mensagem: 'Erro ao listar usuários.', erro });
    }
  }
}