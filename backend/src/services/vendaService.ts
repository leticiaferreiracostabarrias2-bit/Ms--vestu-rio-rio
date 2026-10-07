import { Pool, PoolConnection } from 'mysql2/promise';
import { CriarVendaDTO } from '../types/index';

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
   * Processa uma venda de forma atômica no PDV (valida estoque, desconto e efetua baixa)
   * @param dadosVenda Objeto DTO com dados do carrinho, cliente, usuário e pagamento
   * @returns Retorna o ID da venda criada e o valor total final processado
   */
  public async processarVenda(dadosVenda: CriarVendaDTO): Promise<{ idVenda: number; valorTotal: number }> {
    // Solicita uma conexão exclusiva da pool para executar a transação
    const conexao: PoolConnection = await this.dbPool.getConnection();

    try {
      // Inicia a transação atômica (ACID)
      await conexao.beginTransaction();

      // AREA 1: Cálculo do subtotal dos itens e verificação rígida de estoque
      let subtotalTotal = 0;
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

        // Regra de Negócio RN01: Bloqueio de Venda com Estoque Negativo ou Insuficiente
        if (dadosSku.quantidade_estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para o SKU ID: ${item.varianteSkuId}`);
        }

        // Acumula o subtotal da venda com base no preço cadastrado no SKU
        subtotalTotal += Number(dadosSku.preco_venda) * item.quantidade;
      }

      // AREA 2: Validação da Regra de Desconto (RN03)
      const percentualDesconto = (dadosVenda.desconto / subtotalTotal) * 100;
      if (percentualDesconto > 10 && !dadosVenda.gerenteAutorizouId) {
        throw new Error('Descontos superiores a 10% exigem a autorização/senha de um Gerente.');
      }

      // Calcula o valor total final após aplicação do desconto permitido
      const valorTotalFinal = subtotalTotal - dadosVenda.desconto;

      // AREA 3: Inserção do registro principal da venda
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

      // AREA 4: Inserção dos itens da venda e atualização/baixa de estoque no banco
      for (const item of dadosVenda.itens) {
        const subtotalItem = item.precoUnitario * item.quantidade;

        // Registra o item associado à venda criada
        await conexao.query(
          `INSERT INTO itens_venda (
            quantidade, 
            preco_unitario, 
            subtotal, 
            vendas_idvendas, 
            variantes_sku_idvariantes_sku
          ) VALUES (?, ?, ?, ?, ?)`,
          [item.quantidade, item.precoUnitario, subtotalItem, idVendaCriada, item.varianteSkuId]
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
      // Em caso de qualquer falha na transação, desfaz todas as operações no banco
      await conexao.rollback();
      throw erro;
    } finally {
      // Libera a conexão de volta para a pool de conexões
      conexao.release();
    }
  }
}