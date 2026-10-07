import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IProduto } from '../types';
import { db } from '../config/database';

/**
 * Model estático responsável pelas consultas e inserções do Produto Pai
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
        c.nome AS nomeCategoria
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
}