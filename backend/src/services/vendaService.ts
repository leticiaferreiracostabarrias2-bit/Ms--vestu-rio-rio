import { Pool, PoolConnection } from 'mysql2/promise';
import { CriarVendaDTO } from '../types/index';

interface IItemProcessado {
  varianteSkuId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

/**
 * Camada de serviço responsável pelo processamento e regras de negócio das Vendas
 */
export class VendaService {
  /**
   * Construtor que recebe a pool de conexões do MySQL
   * @param dbPool Instância do Pool de conexões do banco de dados
   */
  constructor(private dbPool: Pool) {}

  /**
   * Processa uma venda de forma atômica no PDV (valida estoque, preço do banco, desconto e efetua baixa)
   * @param dadosVenda Objeto DTO com dados do carrinho, cliente, usuário e pagamento
   * @returns Retorna o ID da venda criada e o valor total final processado
   */
  public async processarVenda(dadosVenda: CriarVendaDTO): Promise<{ idVenda: number; valorTotal: number }> {
    const conexao: PoolConnection = await this.dbPool.getConnection();

    try {
      // Inicia a transação atômica (ACID)
      await conexao.beginTransaction();

      let subtotalTotal = 0;
      const itensValidados: IItemProcessado[] = [];

      // ÁREA 1: Cálculo do subtotal dos itens, verificação rígida de estoque e captura de preços reais
      for (const item of dadosVenda.itens) {
        // Bloqueia a linha da variante SKU com FOR UPDATE para evitar Race Conditions (concorrência)
        const [linhas]: any = await conexao.query(
          'SELECT quantidade_estoque, preco_venda FROM variantes_sku WHERE idvariantes_sku = ? FOR UPDATE',
          [item.varianteSkuId]
        );

        // Valida se o SKU solicitado existe no banco
        if (linhas.length === 0) {
          throw new Error(`SKU ID ${item.varianteSkuId} não encontrado no sistema.`);
        }

        const dadosSku = linhas[0];
        const precoUnitarioBanco = Number(dadosSku.preco_venda);

        // Regra de Negócio RN01: Bloqueio de Venda com Estoque Negativo ou Insuficiente
        if (dadosSku.quantidade_estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para o SKU ID: ${item.varianteSkuId}`);
        }

        const subtotalItem = precoUnitarioBanco * item.quantidade;
        subtotalTotal += subtotalItem;

        // Armazena o item utilizando o preço oficial retornado pelo banco de dados
        itensValidados.push({
          varianteSkuId: item.varianteSkuId,
          quantidade: item.quantidade,
          precoUnitario: precoUnitarioBanco,
          subtotal: subtotalItem
        });
      }

      // ÁREA 2: Validação da Regra de Desconto Geral na Venda (RN03)
      const percentualDesconto = subtotalTotal > 0 ? (dadosVenda.desconto / subtotalTotal) * 100 : 0;
      if (percentualDesconto > 10 && !dadosVenda.gerenteAutorizouId) {
        throw new Error('Descontos superiores a 10% exigem a autorização/senha de um Gerente.');
      }

      // Calcula o valor total final após aplicação do desconto permitido
      const valorTotalFinal = subtotalTotal - dadosVenda.desconto;

      // ÁREA 3: Inserção do registro principal da venda
      const [resultadoVenda]: any = await conexao.query(
        `INSERT INTO vendas (
          valor_total, 
          desconto, 
          forma_pagamento, 
          usuarios_idusuarios, 
          clientes_idclientes, 
          gerente_autorizou_id
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          valorTotalFinal,
          dadosVenda.desconto,
          dadosVenda.formaPagamento,
          dadosVenda.usuarioId,
          dadosVenda.clienteId || null,
          dadosVenda.gerenteAutorizouId || null,
        ]
      );

      const idVendaCriada = resultadoVenda.insertId;

      // ÁREA 4: Inserção dos itens da venda e atualização/baixa de estoque no banco
      for (const item of itensValidados) {
        await conexao.query(
          `INSERT INTO itens_venda (
            quantidade, 
            preco_unitario, 
            subtotal, 
            vendas_idvendas, 
            variantes_sku_idvariantes_sku
          ) VALUES (?, ?, ?, ?, ?)`,
          [item.quantidade, item.precoUnitario, item.subtotal, idVendaCriada, item.varianteSkuId]
        );

        // Executa a baixa física na quantidade de estoque da variante
        await conexao.query(
          `UPDATE variantes_sku 
           SET quantidade_estoque = quantidade_estoque - ?
           WHERE idvariantes_sku = ?`,
          [item.quantidade, item.varianteSkuId]
        );
      }

      // Confirma e consolida a transação no banco de dados
      await conexao.commit();
      return { idVenda: idVendaCriada, valorTotal: valorTotalFinal };

    } catch (erro) {
      // Em caso de qualquer falha, desfaz todas as alterações no banco de dados
      await conexao.rollback();
      throw erro;
    } finally {
      // Libera a conexão de volta para a pool
      conexao.release();
    }
  }

  /**
   * Cancela uma venda e estorna as quantidades dos itens de volta ao estoque de forma atômica
   * @param idVenda ID da venda a ser cancelada
   * @param motivo Justificativa para o cancelamento
   */
  public async cancelarVenda(idVenda: number, motivo: string): Promise<void> {
    const conexao: PoolConnection = await this.dbPool.getConnection();

    try {
      await conexao.beginTransaction();

      // 1. Bloqueia e verifica a existência/status da venda
      const [vendas]: any = await conexao.query(
        'SELECT status FROM vendas WHERE idvendas = ? FOR UPDATE',
        [idVenda]
      );

      if (vendas.length === 0) {
        throw new Error('Venda não encontrada.');
      }

      if (vendas[0].status === 'CANCELADA') {
        throw new Error('Esta venda já se encontra cancelada.');
      }

      // 2. Busca os itens pertencentes à venda
      const [itens]: any = await conexao.query(
        'SELECT quantidade, variantes_sku_idvariantes_sku FROM itens_venda WHERE vendas_idvendas = ?',
        [idVenda]
      );

      // 3. Reverte o estoque para cada variante envolvida
      for (const item of itens) {
        await conexao.query(
          `UPDATE variantes_sku 
           SET quantidade_estoque = quantidade_estoque + ? 
           WHERE idvariantes_sku = ?`,
          [item.quantidade, item.variantes_sku_idvariantes_sku]
        );
      }

      // 4. Marca a venda como CANCELADA e registra a data e motivo
      await conexao.query(
        `UPDATE vendas 
         SET status = 'CANCELADA', cancelada_em = NOW(), motivo_cancelamento = ? 
         WHERE idvendas = ?`,
        [motivo, idVenda]
      );

      await conexao.commit();
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }
}