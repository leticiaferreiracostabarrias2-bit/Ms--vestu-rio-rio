// ==========================================
// TIPOS ENUMERADOS / UNIONS
// ==========================================
export type CargoUsuario = 'CAIXA' | 'GERENTE' | 'ADMIN';
export type FormaPagamento = 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'VALE_TROCA';
export type StatusVenda = 'CONCLUIDA' | 'CANCELADA';

// ==========================================
// INTERFACES DE USUÁRIO / AUTENTICAÇÃO
// ==========================================
export interface Usuario {
  id: number;
  email: string;
  nome: string | null;
  telefone: string | null;
  cargo?: CargoUsuario;
  criado_em?: string;
  atualizado_em?: string;
}

export interface NovoUsuarioForm {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  cargo?: CargoUsuario;
  confirmarSenha?: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

// ==========================================
// INTERFACES DE CLIENTES
// ==========================================
export interface Cliente {
  idCliente: number;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  criadoEm?: string;
}

export interface NovoClienteForm {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
}

// ==========================================
// INTERFACES DE PRODUTOS E VARIANTES (SKUs)
// ==========================================
export interface Categoria {
  idCategoria: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface Produto {
  idProduto: number;
  nome: string;
  precoBase: number;
  ativo: boolean;
  categoriaId: number;
}

export interface VarianteSku {
  idVarianteSku: number;
  sku: string;
  codigoBarras?: string;
  tamanho: string;
  cor: string;
  precoVenda: number;
  quantidadeEstoque: number;
  produtoId: number;
  nomeProduto?: string;
}

// ==========================================
// INTERFACES DE CHECKOUT / PDV / VENDAS
// ==========================================
export interface ItemCarrinho {
  varianteSkuId: number;
  sku: string;
  nomeProduto: string;
  tamanho: string;
  cor: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface CriarVendaDTO {
  usuarioId?: number;
  clienteId?: number;
  formaPagamento: FormaPagamento;
  desconto: number;
  gerenteAutorizouId?: number;
  itens: {
    varianteSkuId: number;
    quantidade: number;
    precoUnitario: number;
  }[];
}

export interface HistoricoCompraCliente {
  vendaId: number;
  dataVenda: string;
  valorTotalVenda: number;
  statusVenda: StatusVenda;
  quantidade: number;
  precoUnitario: number;
  subtotalItem: number;
  nomeProduto: string;
  sku: string;
  tamanho: string;
  cor: string;
}

export interface RelatorioCurvaABC {
  nomeProduto: string;
  sku: string;
  tamanho: string;
  cor: string;
  totalUnidadesVendidas: number;
  faturamentoTotal: number;
}