import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendemos o Request do Express para podermos injetar o ID do usuário autenticado
export interface AuthRequest extends Request {
  usuarioId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    return;
  }

  // O padrão do header é "Bearer <token>"
  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    res.status(401).json({ erro: 'Token mal formatado.' });
    return;
  }

  const token = partes[1];

  try {
    // IMPORTANTE: Em produção, o secret deve vir do .env (process.env.JWT_SECRET)
    const secret = process.env.JWT_SECRET || 'secreta_dev_super_segura';
    
    // Decodifica e extrai o ID que colocamos no payload do token
    const decoded = jwt.verify(token, secret) as { id: number };
    
    // Injeta o ID na requisição para que os controllers saibam quem está logado
    req.usuarioId = decoded.id;
    
    return next(); // Libera a passagem para o Controller
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
    return;
  }
};