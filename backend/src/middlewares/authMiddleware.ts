import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CargoUsuario } from '../types/index';

export interface RequisicaoAutenticada extends Request {
  usuarioLogado?: {
    idUsuario: number;
    email: string;
    cargo: CargoUsuario;
  };
}

export const autenticarToken = (
  req: RequisicaoAutenticada,
  res: Response,
  next: NextFunction
): Response | void => {
  const cabecalhoAuth = req.headers['authorization'];
  const token = cabecalhoAuth && cabecalhoAuth.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const chaveSecreta = process.env.JWT_SECRET || 'chave_secreta_ms2_vestuario';
    const dadosDecodificados = jwt.verify(token, chaveSecreta) as any;

    // Garante a leitura do ID independentemente do nome usado ao assinar o JWT
    const idUsuarioDecodificado = Number(
      dadosDecodificados.idUsuario || dadosDecodificados.id || dadosDecodificados.id_usuario
    );

    req.usuarioLogado = {
      idUsuario: idUsuarioDecodificado,
      email: dadosDecodificados.email,
      cargo: dadosDecodificados.cargo
    };

    return next();
  } catch (erro) {
    return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
  }
};

export const autorizarCargos = (cargosPermitidos: CargoUsuario[]) => {
  return (req: RequisicaoAutenticada, res: Response, next: NextFunction): Response | void => {
    if (!req.usuarioLogado) {
      return res.status(401).json({ mensagem: 'Utilizador não autenticado.' });
    }

    if (!cargosPermitidos.includes(req.usuarioLogado.cargo)) {
      return res.status(403).json({ 
        mensagem: 'Acesso negado. Perfil sem permissão para esta operação.' 
      });
    }

    return next();
  };
};