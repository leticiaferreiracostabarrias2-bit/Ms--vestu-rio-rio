import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IProduto } from '../types';
import { db } from '../config/database';

/**
 * Model estático responsável pelas consultas e persistência do Produto Pai
 */
export class ProdutoModel {

  static async criar(produto: Omit<IProduto, 'idProduto'>): Promise<number> {
    const queryStr = `
      INSERT INTO produtos (nome, preco_base, ativo, categorias_idcategorias)
      VALUES (?, ?, ?, ?)
    `;
    const valores = [produto.nome, produto.precoBase, produto.ativo ?? true, produto.categoriaId];

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.insertId;
  }

  static async buscarPorId(id: number): Promise<IProduto | null> {
    const queryStr = `
      SELECT 
        idprodutos AS idProduto, 
        nome, 
        preco_base AS precoBase, 
        ativo, 
        categorias_idcategorias AS categoriaId 
      FROM produtos 
      WHERE idprodutos = ? 
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [id]
    });

    return linhas.length ? (linhas[0] as IProduto) : null;
  }

  static async buscarTodos(): Promise<any[]> {
    const queryStr = `
      SELECT 
        p.idprodutos AS idProduto, 
        p.nome, 
        p.preco_base AS precoBase, 
        p.ativo, 
        c.nome AS nomeCategoria,
        p.categorias_idcategorias AS categoriaId
      FROM produtos p
      INNER JOIN categorias c ON p.categorias_idcategorias = c.idcategorias
      WHERE p.ativo = 1
      ORDER BY p.nome ASC
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr
    });

    return linhas;
  }

  /**
   * Atualiza as informações de um produto existente pelo ID
   */
  static async atualizar(id: number, produto: Partial<Omit<IProduto, 'idProduto'>>): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (produto.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(produto.nome);
    }
    if (produto.precoBase !== undefined) {
      campos.push('preco_base = ?');
      valores.push(produto.precoBase);
    }
    if (produto.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(produto.ativo);
    }
    if (produto.categoriaId !== undefined) {
      campos.push('categorias_idcategorias = ?');
      valores.push(produto.categoriaId);
    }

    if (campos.length === 0) return false;

    valores.push(id);
    const queryStr = `
      UPDATE produtos 
      SET ${campos.join(', ')} 
      WHERE idprodutos = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.affectedRows > 0;
  }

  /**
   * Remove um produto pelo ID
   */
  static async excluir(id: number): Promise<boolean> {
    const queryStr = `
      DELETE FROM produtos 
      WHERE idprodutos = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: [id]
    });

    return result.affectedRows > 0;
  }
}