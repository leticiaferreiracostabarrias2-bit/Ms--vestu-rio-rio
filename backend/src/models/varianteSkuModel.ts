import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IVarianteSku } from '../types/index';
import { db } from '../config/database';

export class VarianteSkuModel {

  static async criar(variante: Omit<IVarianteSku, 'idVarianteSku'>): Promise<number> {
    const queryStr = `
      INSERT INTO variantes_sku 
      (sku, codigo_barras, tamanho, cor, preco_venda, quantidade_estoque, quantidade_reservada, produtos_idprodutos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valores = [
      variante.sku,
      variante.codigoBarras || null,
      variante.tamanho,
      variante.cor,
      variante.precoVenda,
      variante.quantidadeEstoque ?? 0,
      variante.quantidadeReservada ?? 0,
      variante.produtoId
    ];

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.insertId;
  }

  static async buscarPorId(id: number): Promise<IVarianteSku | null> {
    const queryStr = `
      SELECT 
        v.idvariantes_sku AS idVarianteSku, 
        v.sku, 
        v.codigo_barras AS codigoBarras, 
        v.tamanho, 
        v.cor, 
        v.preco_venda AS precoVenda, 
        v.quantidade_estoque AS quantidadeEstoque, 
        v.quantidade_reservada AS quantidadeReservada, 
        v.produtos_idprodutos AS produtoId,
        p.nome AS nomeProduto,
        c.nome AS nomeCategoria
      FROM variantes_sku v
      INNER JOIN produtos p ON v.produtos_idprodutos = p.idprodutos
      LEFT JOIN categorias c ON p.categorias_idcategorias = c.idcategorias
      WHERE v.idvariantes_sku = ? 
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [id]
    });

    return linhas.length ? (linhas[0] as IVarianteSku) : null;
  }

  static async buscarPorCodigoBarras(codigoBarras: string): Promise<any | null> {
    const queryStr = `
      SELECT 
        v.idvariantes_sku AS idVarianteSku, 
        v.sku, 
        v.codigo_barras AS codigoBarras, 
        v.tamanho, 
        v.cor, 
        v.preco_venda AS precoVenda, 
        v.quantidade_estoque AS quantidadeEstoque, 
        p.nome AS nomeProduto,
        c.nome AS nomeCategoria
      FROM variantes_sku v
      INNER JOIN produtos p ON v.produtos_idprodutos = p.idprodutos
      LEFT JOIN categorias c ON p.categorias_idcategorias = c.idcategorias
      WHERE v.codigo_barras = ? AND p.ativo = 1
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [codigoBarras]
    });

    return linhas.length ? linhas[0] : null;
  }

  static async buscarPorSku(sku: string): Promise<IVarianteSku | null> {
    const queryStr = `
      SELECT 
        v.idvariantes_sku AS idVarianteSku, 
        v.sku, 
        v.codigo_barras AS codigoBarras, 
        v.tamanho, 
        v.cor, 
        v.preco_venda AS precoVenda, 
        v.quantidade_estoque AS quantidadeEstoque, 
        v.quantidade_reservada AS quantidadeReservada, 
        v.produtos_idprodutos AS produtoId,
        p.nome AS nomeProduto,
        c.nome AS nomeCategoria
      FROM variantes_sku v
      INNER JOIN produtos p ON v.produtos_idprodutos = p.idprodutos
      LEFT JOIN categorias c ON p.categorias_idcategorias = c.idcategorias
      WHERE v.sku = ? 
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [sku]
    });

    return linhas.length ? (linhas[0] as IVarianteSku) : null;
  }

  static async buscarTodas(): Promise<any[]> {
    const queryStr = `
      SELECT 
        v.idvariantes_sku AS idVarianteSku, 
        v.sku, 
        v.codigo_barras AS codigoBarras, 
        v.tamanho, 
        v.cor, 
        v.preco_venda AS precoVenda, 
        v.quantidade_estoque AS quantidadeEstoque, 
        v.quantidade_reservada AS quantidadeReservada, 
        v.produtos_idprodutos AS produtoId,
        p.nome AS nomeProduto,
        c.nome AS nomeCategoria,
        p.categorias_idcategorias AS categoriaId
      FROM variantes_sku v
      INNER JOIN produtos p ON v.produtos_idprodutos = p.idprodutos
      LEFT JOIN categorias c ON p.categorias_idcategorias = c.idcategorias
      ORDER BY p.nome ASC, v.sku ASC
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr
    });

    return linhas;
  }

  // Novo método para filtrar por Categoria
  static async buscarPorCategoria(categoriaId: number): Promise<any[]> {
    const queryStr = `
      SELECT 
        v.idvariantes_sku AS idVarianteSku, 
        v.sku, 
        v.codigo_barras AS codigoBarras, 
        v.tamanho, 
        v.cor, 
        v.preco_venda AS precoVenda, 
        v.quantidade_estoque AS quantidadeEstoque, 
        v.quantidade_reservada AS quantidadeReservada, 
        v.produtos_idprodutos AS produtoId,
        p.nome AS nomeProduto,
        c.nome AS nomeCategoria,
        p.categorias_idcategorias AS categoriaId
      FROM variantes_sku v
      INNER JOIN produtos p ON v.produtos_idprodutos = p.idprodutos
      LEFT JOIN categorias c ON p.categorias_idcategorias = c.idcategorias
      WHERE p.categorias_idcategorias = ? AND p.ativo = 1
      ORDER BY p.nome ASC, v.sku ASC
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [categoriaId]
    });

    return linhas;
  }

  static async atualizarEstoque(idVarianteSku: number, novaQuantidade: number): Promise<boolean> {
    const queryStr = `
      UPDATE variantes_sku 
      SET quantidade_estoque = ? 
      WHERE idvariantes_sku = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: [novaQuantidade, idVarianteSku]
    });

    return result.affectedRows > 0;
  }

  static async atualizar(id: number, variante: Partial<Omit<IVarianteSku, 'idVarianteSku'>>): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (variante.sku !== undefined) {
      campos.push('sku = ?');
      valores.push(variante.sku);
    }
    if (variante.codigoBarras !== undefined) {
      campos.push('codigo_barras = ?');
      valores.push(variante.codigoBarras || null);
    }
    if (variante.tamanho !== undefined) {
      campos.push('tamanho = ?');
      valores.push(variante.tamanho);
    }
    if (variante.cor !== undefined) {
      campos.push('cor = ?');
      valores.push(variante.cor);
    }
    if (variante.precoVenda !== undefined) {
      campos.push('preco_venda = ?');
      valores.push(variante.precoVenda);
    }
    if (variante.quantidadeEstoque !== undefined) {
      campos.push('quantidade_estoque = ?');
      valores.push(variante.quantidadeEstoque);
    }
    if (variante.quantidadeReservada !== undefined) {
      campos.push('quantidade_reservada = ?');
      valores.push(variante.quantidadeReservada);
    }
    if (variante.produtoId !== undefined) {
      campos.push('produtos_idprodutos = ?');
      valores.push(variante.produtoId);
    }

    if (campos.length === 0) return false;

    valores.push(id);
    const queryStr = `
      UPDATE variantes_sku 
      SET ${campos.join(', ')} 
      WHERE idvariantes_sku = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.affectedRows > 0;
  }

  static async excluir(id: number): Promise<boolean> {
    const queryStr = `
      DELETE FROM variantes_sku 
      WHERE idvariantes_sku = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: [id]
    });

    return result.affectedRows > 0;
  }
}