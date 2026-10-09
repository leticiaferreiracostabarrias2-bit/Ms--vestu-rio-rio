/**
 * Tipos enumerados (Enums/Unions) para padronização de papéis, pagamentos e status
 */
export type CargoUsuario = 'CAIXA' | 'GERENTE' | 'ADMIN';
export type FormaPagamento = 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'VALE_TROCA';
export type StatusVenda = 'CONCLUIDA' | 'CANCELADA';

/**
 * Interface que representa a entidade de Usuários do sistema
 */
export interface IUsuario {
  idUsuario?: number;
  nome: string;
  email: string;
  senha?: string;
  cargo: CargoUsuario;
  criadoEm: Date;
}

/**
 * Interface para gestão de dados dos Clientes
 */
export interface ICliente {
  idCliente?: number;
  nome: string;
  senha: string;
  cpfCnpj: string;
  telefone?: string;
  email?: string;
  criadoEm: Date;
}

/**
 * Interface para categorização dos produtos de vestuário
 */
export interface ICategoria {
  idCategoria?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

/**
 * Interface referente ao cadastro base do Produto
 */
export interface IProduto {
  idProduto?: number;
  nome: string;
  precoBase: number;
  ativo: boolean;
  categoriaId: number;
}

/**
 * Interface para as Variantes de produtos (SKUs com tamanhos e cores específicas)
 */
export interface IVarianteSku {
  idVarianteSku?: number;
  sku: string;
  codigoBarras?: string;
  tamanho: string;
  cor: string;
  precoVenda: number;
  quantidadeEstoque: number;
  quantidadeReservada: number;
  produtoId: number;
}

/**
 * Interface da entidade ItemVenda persistida no banco
 */
export interface IItemVenda {
  idItemVenda?: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  vendaId: number;
  varianteSkuId: number;
}

/**
 * DTO (Data Transfer Object) para entrada de itens na composição do checkout
 */
export interface ItemVendaDTO {
  varianteSkuId: number; // ID do produto/variante selecionado
  quantidade: number;    // Quantidade levada pelo cliente
  precoUnitario: number; // Preço praticado no momento da venda
}
/**
 * DTO para criação e processamento de uma nova Venda no PDV
 */
export interface CriarVendaDTO {
  usuarioId: number;            // ID do operador de caixa logado
  clienteId?: number;           // ID do cliente (opcional, caso ele queira CPF na nota/fidelidade)[cite: 3]
  formaPagamento: FormaPagamento; // DINHEIRO, PIX, CARTAO_CREDITO, etc.
  desconto: number;             // Valor total de desconto concedido
  gerenteAutorizouId?: number;  // ID do gerente (obrigatório se o desconto for > 10% - RN03)[cite: 3]
  itens: ItemVendaDTO[];        // Lista (array) contendo todos os produtos do carrinho
}