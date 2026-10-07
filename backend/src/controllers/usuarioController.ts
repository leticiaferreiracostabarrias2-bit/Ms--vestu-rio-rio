import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UsuarioModel } from '../models/usuarioModel';
import { IUsuario } from '../types';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware'; // Importe a interface que criamos

export class UsuarioController {
  
  static async criar(req: Request, res: Response): Promise<Response> {
    try {
      const { email, nome, telefone, senha } = req.body;

      // 1. Validação de Entrada Simples (Fail Fast)
      if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
      }

      // 2. Sanitização de Dados
      const emailSanitizado = email.trim().toLowerCase();
      const telefoneSanitizado = telefone ? telefone.replace(/\D/g, '') : null;
      const nomeSanitizado = nome ? nome.trim() : null;

      // 3. Regra de Negócio: Evitar e-mails duplicados
      const usuarioExistente = await UsuarioModel.buscarPorEmail(emailSanitizado);
      if (usuarioExistente) {
        return res.status(409).json({ erro: 'Este e-mail já está em uso.' });
      }

      // 4. Segurança: Geração de Hash para a senha (Custo padrão = 10)
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      // 5. Montagem do payload e Persistência
      const novoUsuario: IUsuario = {
        email: emailSanitizado,
        nome: nomeSanitizado,
        telefone: telefoneSanitizado,
        senha: senhaHash
      };

      const id = await UsuarioModel.criar(novoUsuario);

      // 6. Retorno de Sucesso Omitindo Dados Sensíveis
      return res.status(201).json({
        mensagem: 'Usuário criado com sucesso',
        usuario: {
          id,
          email: emailSanitizado,
          nome: nomeSanitizado,
          telefone: telefoneSanitizado
        }
      });

    } catch (error) {
      console.error('[UsuarioController.criar] Erro ao criar usuário:', error);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
      }

      const emailFormatado = email.toLowerCase().trim();
      console.log(`[Login] Tentativa de autenticação para: "${emailFormatado}"`);

      const usuario = await UsuarioModel.buscarPorEmail(emailFormatado);
      
      // 1. Verifica se usuário existe
      if (!usuario) {
        console.warn(`[Login] Falha: Nenhum usuário encontrado com o e-mail "${emailFormatado}".`);
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      // 2. Compara a senha enviada com o hash do banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        console.warn(`[Login] Falha: Senha incorreta para o usuário "${emailFormatado}".`);
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      console.log(`[Login] Sucesso: Usuário "${usuario.nome}" (${usuario.email}) autenticado.`);

      // 3. Gera o JWT (Expira em 24 horas)
      const secret = process.env.JWT_SECRET || 'secreta_dev_super_segura';
      const token = jwt.sign({ id: usuario.id }, secret, { expiresIn: '24h' });

      return res.status(200).json({
        mensagem: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome
        }
      });
    } catch (error) {
      console.error('[UsuarioController.login] Erro:', error);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  static async logout(req: AuthRequest, res: Response): Promise<Response> {
    // Como JWT é stateless, avisamos o front-end para destruir o token.
    return res.status(200).json({ 
      mensagem: 'Logout processado. Remova o token no cliente.' 
    });
  }

  static async buscarTodos(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const usuarios = await UsuarioModel.buscarTodos();
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('[UsuarioController.buscarTodos] Erro:', error);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }

  static async buscarPorId(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        return res.status(400).json({ erro: 'ID inválido.' });
      }

      const usuario = await UsuarioModel.buscarPorId(id);

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      // Omitimos a senha manualmente antes de retornar
      const { senha, ...usuarioSeguro } = usuario;

      return res.status(200).json(usuarioSeguro);
    } catch (error) {
      console.error('[UsuarioController.buscarPorId] Erro:', error);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
}