import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IVarianteSku } from '../types';
import { db } from '../config/database';

/**
 * Model estático focado na leitura ágil de SKUs, estoque e Código de Barras
 */
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
        p.nome AS nomeProduto
      FROM variantes_sku v
      INNER JOIN produtos p ON v.produtos_idprodutos = p.idprodutos
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
        idvariantes_sku AS idVarianteSku, 
        sku, 
        codigo_barras AS codigoBarras, 
        tamanho, 
        cor, 
        preco_venda AS precoVenda, 
        quantidade_estoque AS quantidadeEstoque, 
        quantidade_reservada AS quantidadeReservada, 
        produtos_idprodutos AS produtoId
      FROM variantes_sku 
      WHERE sku = ? 
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [sku]
    });

    return linhas.length ? (linhas[0] as IVarianteSku) : null;
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
}