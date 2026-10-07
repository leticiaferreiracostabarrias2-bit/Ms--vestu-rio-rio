import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IUsuario } from '../types';
import { db } from '../config/database';

/**
 * Model estático responsável pelas operações de persistência e consulta de usuários
 */
export class UsuarioModel {
  
  static async criar(usuario: Omit<IUsuario, 'idusuarios' | 'criadoEm'>): Promise<number> {
    const queryStr = `
      INSERT INTO usuarios (nome, email, senha, cargo)
      VALUES (?, ?, ?, ?)
    `;
    const valores = [usuario.nome, usuario.email, usuario.senha, usuario.cargo];
    
    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });
    
    return result.insertId;
  }

  static async buscarPorEmail(email: string): Promise<IUsuario | null> {
    const queryStr = `
      SELECT 
        idusuarios AS idUsuario, 
        nome, 
        email, 
        senha, 
        cargo, 
        criado_em AS criadoEm 
      FROM usuarios 
      WHERE email = ? 
      LIMIT 1
    `;
    
    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [email]
    });
    
    return linhas.length ? (linhas[0] as IUsuario) : null;
  }

  static async buscarPorId(id: number): Promise<IUsuario | null> {
    const queryStr = `
      SELECT 
        idusuarios AS idUsuario, 
        nome, 
        email, 
        cargo, 
        criado_em AS criadoEm 
      FROM usuarios 
      WHERE idusuarios = ? 
      LIMIT 1
    `;
    
    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [id]
    });
    
    return linhas.length ? (linhas[0] as IUsuario) : null;
  }

  static async buscarTodos(): Promise<Omit<IUsuario, 'senha'>[]> {
    // Omite a senha da consulta massiva por questão de segurança (RNF03)
    const queryStr = `
      SELECT 
        idusuarios AS idUsuario, 
        nome, 
        email, 
        cargo, 
        criado_em AS criadoEm 
      FROM usuarios 
      ORDER BY nome ASC
    `;
    
    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr
    });
    
    return linhas as Omit<IUsuario, 'senha'>[];
  }
}