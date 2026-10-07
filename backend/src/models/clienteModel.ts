import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ICliente } from '../types';
import { db } from '../config/database';

/**
 * Model estático responsável pelas operações na tabela de clientes
 */
export class ClienteModel {

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
}