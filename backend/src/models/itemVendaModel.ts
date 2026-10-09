import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { IItemVenda } from '../types';
import { db } from '../config/database';

/**
 * Model estático para manipulação de itens de venda e relatórios de desempenho/Curva ABC
 */
export class ItemVendaModel {

  static async criar(item: Omit<IItemVenda, 'idItemVenda'>): Promise<number> {
    const queryStr = `
      INSERT INTO itens_venda 
      (quantidade, preco_unitario, subtotal, vendas_idvendas, variantes_sku_idvariantes_sku)
      VALUES (?, ?, ?, ?, ?)
    `;
    const valores = [
      item.quantidade,
      item.precoUnitario,
      item.subtotal,
      item.vendaId,
      item.varianteSkuId
    ];

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.insertId;
  }

  static async buscarPorVendaId(vendaId: number): Promise<any[]> {
    const queryStr = `
      SELECT 
        iv.iditens_venda AS idItemVenda,
        iv.quantidade,
        iv.preco_unitario AS precoUnitario,
        iv.subtotal,
        iv.vendas_idvendas AS vendaId,
        iv.variantes_sku_idvariantes_sku AS varianteSkuId,
        vsku.sku,
        p.nome AS nomeProduto,
        vsku.tamanho,
        vsku.cor
      FROM itens_venda iv
      INNER JOIN variantes_sku vsku ON iv.variantes_sku_idvariantes_sku = vsku.idvariantes_sku
      INNER JOIN produtos p ON vsku.produtos_idprodutos = p.idprodutos
      WHERE iv.vendas_idvendas = ?
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [vendaId]
    });

    return linhas;
  }

  static async buscarMaisVendidos(limite: number = 10): Promise<any[]> {
    const limiteNumerico = Number(limite);

    const queryStr = `
      SELECT 
        p.nome AS nomeProduto,
        vsku.sku,
        vsku.tamanho,
        vsku.cor,
        SUM(iv.quantidade) AS totalUnidadesVendidas,
        SUM(iv.subtotal) AS faturamentoTotal
      FROM itens_venda iv
      INNER JOIN variantes_sku vsku ON iv.variantes_sku_idvariantes_sku = vsku.idvariantes_sku
      INNER JOIN produtos p ON vsku.produtos_idprodutos = p.idprodutos
      INNER JOIN vendas v ON iv.vendas_idvendas = v.idvendas
      WHERE v.status = 'CONCLUIDA'
      GROUP BY iv.variantes_sku_idvariantes_sku, p.nome, vsku.sku, vsku.tamanho, vsku.cor
      ORDER BY totalUnidadesVendidas DESC
      LIMIT ${limiteNumerico}
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr
    });

    return linhas;
  }
}