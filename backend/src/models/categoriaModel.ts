import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ICategoria } from '../types';
import { db } from '../config/database';

/**
 * Model estático para manutenção do cadastro de categorias
 */
export class CategoriaModel {

  static async criar(categoria: Omit<ICategoria, 'idCategoria'>): Promise<number> {
    const queryStr = `
      INSERT INTO categorias (nome, descricao, ativo)
      VALUES (?, ?, ?)
    `;
    const valores = [categoria.nome, categoria.descricao || null, categoria.ativo ?? true];

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.insertId;
  }

  static async buscarPorId(id: number): Promise<ICategoria | null> {
    const queryStr = `
      SELECT 
        idcategorias AS idCategoria, 
        nome, 
        descricao, 
        ativo 
      FROM categorias 
      WHERE idcategorias = ? 
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [id]
    });

    return linhas.length ? (linhas[0] as ICategoria) : null;
  }

  static async buscarTodasAtivas(): Promise<ICategoria[]> {
    const queryStr = `
      SELECT 
        idcategorias AS idCategoria, 
        nome, 
        descricao, 
        ativo 
      FROM categorias 
      WHERE ativo = 1 
      ORDER BY nome ASC
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr
    });

    return linhas as ICategoria[];
  }
}