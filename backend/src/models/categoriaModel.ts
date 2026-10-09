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

  static async buscarPorNome(nome: string): Promise<ICategoria | null> {
    const queryStr = `
      SELECT 
        idcategorias AS idCategoria, 
        nome, 
        descricao, 
        ativo 
      FROM categorias 
      WHERE nome = ? 
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [nome]
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

  static async buscarTodas(): Promise<ICategoria[]> {
    const queryStr = `
      SELECT 
        idcategorias AS idCategoria, 
        nome, 
        descricao, 
        ativo 
      FROM categorias 
      ORDER BY nome ASC
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr
    });

    return linhas as ICategoria[];
  }

  /**
   * Atualiza os dados de uma categoria existente
   */
  static async atualizar(id: number, categoria: Partial<Omit<ICategoria, 'idCategoria'>>): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (categoria.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(categoria.nome);
    }
    if (categoria.descricao !== undefined) {
      campos.push('descricao = ?');
      valores.push(categoria.descricao || null);
    }
    if (categoria.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(categoria.ativo);
    }

    if (campos.length === 0) return false;

    valores.push(id);
    const queryStr = `
      UPDATE categorias 
      SET ${campos.join(', ')} 
      WHERE idcategorias = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.affectedRows > 0;
  }

  /**
   * Remove uma categoria pelo ID
   */
  static async excluir(id: number): Promise<boolean> {
    const queryStr = `
      DELETE FROM categorias 
      WHERE idcategorias = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: [id]
    });

    return result.affectedRows > 0;
  }
}