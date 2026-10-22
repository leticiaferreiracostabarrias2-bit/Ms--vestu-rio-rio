import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ICliente } from '../types';
import { db } from '../config/database';

/**
 * Model estático responsável pelas operações na tabela de clientes
 */
export class ClienteModel {

  /**
   * Insere um novo cliente no banco de dados (sem senha)
   */
  static async criar(cliente: Omit<ICliente, 'idCliente' | 'criadoEm'>): Promise<number> {
    const queryStr = `
      INSERT INTO clientes (nome, cpf_cnpj, telefone, email)
      VALUES (?, ?, ?, ?)
    `;
    const valores = [cliente.nome, cliente.cpfCnpj || null, cliente.telefone || null, cliente.email || null];

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.insertId;
  }

  /**
   * Busca um cliente pelo seu ID
   */
  static async buscarPorId(id: number): Promise<ICliente | null> {
    const queryStr = `
      SELECT 
        idclientes AS idCliente, 
        nome, 
        cpf_cnpj AS cpfCnpj, 
        telefone, 
        email, 
        criado_em AS criadoEm 
      FROM clientes 
      WHERE idclientes = ? 
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [id]
    });

    return linhas.length ? (linhas[0] as ICliente) : null;
  }

  /**
   * Busca um cliente pelo CPF ou CNPJ
   */
  static async buscarPorCpfCnpj(cpfCnpj: string): Promise<ICliente | null> {
    const queryStr = `
      SELECT 
        idclientes AS idCliente, 
        nome, 
        cpf_cnpj AS cpfCnpj, 
        telefone, 
        email, 
        criado_em AS criadoEm 
      FROM clientes 
      WHERE cpf_cnpj = ? 
      LIMIT 1
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr,
      values: [cpfCnpj]
    });

    return linhas.length ? (linhas[0] as ICliente) : null;
  }

  /**
   * Lista todos os clientes cadastrados em ordem alfabética
   */
  static async buscarTodos(): Promise<ICliente[]> {
    const queryStr = `
      SELECT 
        idclientes AS idCliente, 
        nome, 
        cpf_cnpj AS cpfCnpj, 
        telefone, 
        email, 
        criado_em AS criadoEm 
      FROM clientes 
      ORDER BY nome ASC
    `;

    const [linhas] = await db.execute<RowDataPacket[]>({
      sql: queryStr
    });

    return linhas as ICliente[];
  }

  /**
   * Atualiza dados cadastrais do cliente
   */
  static async atualizar(id: number, cliente: Partial<Omit<ICliente, 'idCliente' | 'criadoEm'>>): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (cliente.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(cliente.nome);
    }
    if (cliente.cpfCnpj !== undefined) {
      campos.push('cpf_cnpj = ?');
      valores.push(cliente.cpfCnpj || null);
    }
    if (cliente.telefone !== undefined) {
      campos.push('telefone = ?');
      valores.push(cliente.telefone || null);
    }
    if (cliente.email !== undefined) {
      campos.push('email = ?');
      valores.push(cliente.email || null);
    }

    if (campos.length === 0) return false;

    valores.push(id);
    const queryStr = `
      UPDATE clientes 
      SET ${campos.join(', ')} 
      WHERE idclientes = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: valores
    });

    return result.affectedRows > 0;
  }

  /**
   * Remove o cadastro de um cliente pelo ID
   */
  static async excluir(id: number): Promise<boolean> {
    const queryStr = `
      DELETE FROM clientes 
      WHERE idclientes = ?
    `;

    const [result] = await db.execute<ResultSetHeader>({
      sql: queryStr,
      values: [id]
    });

    return result.affectedRows > 0;
  }
}