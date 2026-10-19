import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { type Produto, type Categoria, type CargoUsuario } from '../../types';
import { FeedbackModal } from '../FeedbackModal';
import { ConfirmacaoModal } from '../ConfirmacaoModal';
import { Crown, DollarSign, Receipt, Shirt, Plus, Pencil, Trash2, Ban, X, UserPlus, Tags, FolderPlus } from 'lucide-react';

interface VendaResumo {
  idvendas: number;
  data_venda: string;
  valor_total: number;
  desconto: number;
  forma_pagamento: string;
  status: 'CONCLUIDA' | 'CANCELADA';
  vendedor: string;
  cliente: string | null;
}

export function PainelGerente() {
  const [abaAtiva, setAbaAtiva] = useState<'metricas' | 'vendas' | 'produtos' | 'usuarios'>('metricas');

  // Dados do Dashboard Financeiro
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [carregandoVendas, setCarregandoVendas] = useState(true);

  // Dados do CRUD de Produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);

  // Estados do Formulário de Produto
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(null);
  const [nomeProduto, setNomeProduto] = useState('');
  const [precoBase, setPrecoBase] = useState<number>(0);
  const [categoriaId, setCategoriaId] = useState<number | ''>('');

  // Estados da Gestão de Categorias
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [descricaoCategoria, setDescricaoCategoria] = useState('');
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);

  // Estados do Cadastro de Usuários
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [senhaUsuario, setSenhaUsuario] = useState('');
  const [cargoUsuario, setCargoUsuario] = useState<CargoUsuario>('CAIXA');
  const [salvandoUsuario, setSalvandoUsuario] = useState(false);

  // Exclusão / Cancelamento de Venda
  const [vendaParaCancelar, setVendaParaCancelar] = useState<VendaResumo | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [processandoCancelamento, setProcessandoCancelamento] = useState(false);

  // Feedback Modal
  const [modalFeedback, setModalFeedback] = useState<{ visivel: boolean; tipo: 'sucesso' | 'erro'; titulo: string; mensagem: string }>({
    visivel: false,
    tipo: 'sucesso',
    titulo: '',
    mensagem: ''
  });

  useEffect(() => {
    carregarDadosFinanceiros();
    carregarProdutosECategorias();
  }, []);

  const carregarDadosFinanceiros = async () => {
    setCarregandoVendas(true);
    try {
      const res = await api.get('/vendas');
      setVendas(res.data);
    } catch (erro) {
      console.error('Erro ao carregar vendas:', erro);
    } finally {
      setCarregandoVendas(false);
    }
  };

  const carregarProdutosECategorias = async () => {
    setCarregandoProdutos(true);
    try {
      const [resProd, resCat] = await Promise.all([
        api.get('/produtos'),
        api.get('/categorias')
      ]);
      setProdutos(resProd.data);
      setCategorias(resCat.data);
    } catch (erro) {
      console.error('Erro ao carregar produtos e categorias:', erro);
    } finally {
      setCarregandoProdutos(false);
    }
  };

  // CRUD de Produtos: Salvar / Atualizar
  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeProduto.trim() || !categoriaId) return;

    try {
      if (produtoEditandoId) {
        await api.put(`/produtos/${produtoEditandoId}`, {
          nome: nomeProduto.trim(),
          precoBase: Number(precoBase),
          categoriaId: Number(categoriaId)
        });
        setModalFeedback({
          visivel: true,
          tipo: 'sucesso',
          titulo: 'Produto Atualizado!',
          mensagem: 'Informações do produto alteradas com sucesso.'
        });
      } else {
        await api.post('/produtos', {
          nome: nomeProduto.trim(),
          precoBase: Number(precoBase),
          categoriaId: Number(categoriaId)
        });
        setModalFeedback({
          visivel: true,
          tipo: 'sucesso',
          titulo: 'Produto Cadastrado!',
          mensagem: 'Novo produto adicionado ao catálogo.'
        });
      }

      fecharModalProduto();
      carregarProdutosECategorias();
    } catch (erro: any) {
      const msg = erro.response?.data?.mensagem || 'Falha ao salvar produto.';
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro ao Salvar',
        mensagem: msg
      });
    }
  };

  const abrirEditarProduto = (prod: Produto) => {
    setProdutoEditandoId(prod.idProduto);
    setNomeProduto(prod.nome);
    setPrecoBase(prod.precoBase);
    setCategoriaId(prod.categoriaId);
    setModalProdutoAberto(true);
  };

  const fecharModalProduto = () => {
    setModalProdutoAberto(false);
    setProdutoEditandoId(null);
    setNomeProduto('');
    setPrecoBase(0);
    setCategoriaId('');
  };

  const excluirProduto = async (id: number) => {
    try {
      await api.delete(`/produtos/${id}`);
      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Produto Removido',
        mensagem: 'O produto foi excluído com sucesso.'
      });
      carregarProdutosECategorias();
    } catch (erro: any) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro ao Excluir',
        mensagem: erro.response?.data?.mensagem || 'Não é possível excluir produtos vinculados a vendas ou variantes.'
      });
    }
  };

  // Gestão de Categorias
  const handleCriarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCategoria.trim()) return;

    setSalvandoCategoria(true);
    try {
      await api.post('/categorias', {
        nome: nomeCategoria.trim(),
        descricao: descricaoCategoria.trim() || undefined
      });

      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Categoria Criada!',
        mensagem: `A categoria "${nomeCategoria.trim()}" foi adicionada com sucesso.`
      });

      setNomeCategoria('');
      setDescricaoCategoria('');
      carregarProdutosECategorias();
    } catch (erro: any) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro na Categoria',
        mensagem: erro.response?.data?.mensagem || 'Falha ao criar categoria.'
      });
    } finally {
      setSalvandoCategoria(false);
    }
  };

  const excluirCategoria = async (idCat?: number) => {
    if (!idCat) return;
    try {
      await api.delete(`/categorias/${idCat}`);
      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Categoria Excluída',
        mensagem: 'A categoria foi removida com sucesso.'
      });
      carregarProdutosECategorias();
    } catch (erro: any) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro ao Excluir',
        mensagem: erro.response?.data?.mensagem || 'Não é possível remover categorias vinculadas a produtos.'
      });
    }
  };

  // Cadastro de Novo Usuário (Aba Gerência)
  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeUsuario.trim() || !emailUsuario.trim() || !senhaUsuario.trim()) return;

    setSalvandoUsuario(true);
    try {
      await api.post('/usuarios', {
        nome: nomeUsuario.trim(),
        email: emailUsuario.trim(),
        senha: senhaUsuario.trim(),
        cargo: cargoUsuario
      });

      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Usuário Criado!',
        mensagem: `O perfil de ${cargoUsuario} para "${nomeUsuario}" foi cadastrado e já pode realizar login.`
      });

      setNomeUsuario('');
      setEmailUsuario('');
      setSenhaUsuario('');
      setCargoUsuario('CAIXA');
    } catch (erro: any) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro no Cadastro',
        mensagem: erro.response?.data?.mensagem || 'Falha ao registrar novo usuário.'
      });
    } finally {
      setSalvandoUsuario(false);
    }
  };

  // Estorno de Venda
  const confirmarEstornoVenda = async () => {
    if (!vendaParaCancelar || !motivoCancelamento.trim()) return;

    setProcessandoCancelamento(true);
    try {
      await api.patch(`/vendas/${vendaParaCancelar.idvendas}/cancelar`, {
        motivo: motivoCancelamento.trim()
      });

      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Venda Cancelada',
        mensagem: `Venda #${vendaParaCancelar.idvendas} estornada e itens devolvidos ao estoque.`
      });

      setVendaParaCancelar(null);
      setMotivoCancelamento('');
      carregarDadosFinanceiros();
    } catch (erro: any) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Falha no Estorno',
        mensagem: erro.response?.data?.mensagem || 'Erro ao cancelar a venda.'
      });
    } finally {
      setProcessandoCancelamento(false);
    }
  };

  // Métricas do Dashboard Financeiro
  const vendasConcluidas = vendas.filter(v => v.status === 'CONCLUIDA');
  const faturamentoTotal = vendasConcluidas.reduce((acc, v) => acc + Number(v.valor_total), 0);
  const ticketMedio = vendasConcluidas.length > 0 ? faturamentoTotal / vendasConcluidas.length : 0;
  const totalDescontos = vendasConcluidas.reduce((acc, v) => acc + Number(v.desconto), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* CABEÇALHO DA PÁGINA COM SELEÇÃO DE ABAS */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-400" />
            Painel de Gerência & Controle
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Métricas financeiras, histórico de ganhos, produtos e usuários do sistema
          </p>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex flex-wrap bg-slate-900 p-1.5 rounded-xl border border-slate-700 self-start md:self-center gap-1">
          <button
            onClick={() => setAbaAtiva('metricas')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              abaAtiva === 'metricas' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Métricas
          </button>
          <button
            onClick={() => setAbaAtiva('vendas')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              abaAtiva === 'vendas' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Vendas
          </button>
          <button
            onClick={() => setAbaAtiva('produtos')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              abaAtiva === 'produtos' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            Produtos
          </button>
          <button
            onClick={() => setAbaAtiva('usuarios')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              abaAtiva === 'usuarios' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Criar Usuário
          </button>
        </div>
      </div>

      {/* ABA 1: GANHOS & MÉTRICAS FINANCEIRAS */}
      {abaAtiva === 'metricas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Faturamento Total</span>
              <p className="text-3xl font-black text-emerald-400">R$ {faturamentoTotal.toFixed(2)}</p>
              <span className="text-xs text-slate-500 mt-1 block">{vendasConcluidas.length} venda(s) concluída(s)</span>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Ticket Médio</span>
              <p className="text-3xl font-black text-cyan-400">R$ {ticketMedio.toFixed(2)}</p>
              <span className="text-xs text-slate-500 mt-1 block">Média por atendimento</span>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Descontos Concedidos</span>
              <p className="text-3xl font-black text-amber-400">R$ {totalDescontos.toFixed(2)}</p>
              <span className="text-xs text-slate-500 mt-1 block">Total de abatimentos no caixa</span>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Vendas Canceladas</span>
              <p className="text-3xl font-black text-red-400">{vendas.filter(v => v.status === 'CANCELADA').length}</p>
              <span className="text-xs text-slate-500 mt-1 block">Estornos efetuados</span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: HISTÓRICO DE VENDAS */}
      {abaAtiva === 'vendas' && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Todas as Vendas Registradas</h2>
            <span className="text-xs text-slate-400">{vendas.length} registro(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700 text-xs font-bold uppercase text-slate-400">
                  <th className="p-4">Nº Venda</th>
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Vendedor</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4">Valor Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm text-slate-300">
                {vendas.map((v) => (
                  <tr key={v.idvendas} className="hover:bg-slate-700/30 transition">
                    <td className="p-4 font-mono font-bold text-cyan-400">#{v.idvendas}</td>
                    <td className="p-4 text-xs">{new Date(v.data_venda).toLocaleString('pt-BR')}</td>
                    <td className="p-4 font-semibold text-white">{v.vendedor}</td>
                    <td className="p-4">{v.cliente || <span className="text-slate-500 italic">Balcão</span>}</td>
                    <td className="p-4 text-xs font-bold text-slate-400">{v.forma_pagamento}</td>
                    <td className="p-4 font-bold text-emerald-400">R$ {Number(v.valor_total).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        v.status === 'CONCLUIDA' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {v.status === 'CONCLUIDA' && (
                        <button
                          onClick={() => {
                            setVendaParaCancelar(v);
                            setMotivoCancelamento('');
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Estornar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: CRUD DE PRODUTOS & CATEGORIAS */}
      {abaAtiva === 'produtos' && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Catálogo do Sistema</h2>
              <p className="text-xs text-slate-400">Cadastre e altere informações dos produtos e categorias</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setModalCategoriaAberto(true)}
                className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-cyan-300 border border-cyan-500/30 font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Tags className="w-4 h-4" />
                Categorias ({categorias.length})
              </button>
              <button
                onClick={() => {
                  fecharModalProduto();
                  setModalProdutoAberto(true);
                }}
                className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Novo Produto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos.map((prod) => (
              <div key={prod.idProduto} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-base">{prod.nome}</h3>
                  <p className="text-xs text-slate-400 mt-1">Preço Base: <strong className="text-emerald-400">R$ {Number(prod.precoBase).toFixed(2)}</strong></p>
                </div>

                <div className="mt-4 flex gap-2 border-t border-slate-800 pt-3">
                  <button
                    onClick={() => abrirEditarProduto(prod)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => excluirProduto(prod.idProduto!)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center"
                    title="Excluir Produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: CADASTRAR NOVO USUÁRIO */}
      {abaAtiva === 'usuarios' && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-700 pb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-cyan-400" />
              Cadastrar Novo Colaborador
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Crie contas de acesso para caixas, gerentes ou administradores do sistema.
            </p>
          </div>

          <form onSubmit={handleCriarUsuario} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={nomeUsuario}
                onChange={(e) => setNomeUsuario(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">E-mail de Acesso *</label>
              <input
                type="email"
                required
                placeholder="joao@ms2vestuario.com"
                value={emailUsuario}
                onChange={(e) => setEmailUsuario(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Senha Inicial *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={senhaUsuario}
                onChange={(e) => setSenhaUsuario(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Cargo / Perfil de Acesso *</label>
              <select
                value={cargoUsuario}
                onChange={(e) => setCargoUsuario(e.target.value as CargoUsuario)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="CAIXA">CAIXA (Operação de PDV e Clientes)</option>
                <option value="GERENTE">GERENTE (Relatórios, Produtos e Descontos)</option>
                <option value="ADMIN">ADMIN (Acesso Total)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={salvandoUsuario}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {salvandoUsuario ? 'Cadastrando...' : 'Cadastrar Colaborador'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL GESTÃO DE CATEGORIAS */}
      {modalCategoriaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Tags className="w-5 h-5 text-cyan-400" />
                Gerenciamento de Categorias
              </h3>
              <button onClick={() => setModalCategoriaAberto(false)} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário de Criação Rápida */}
            <form onSubmit={handleCriarCategoria} className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-700">
              <h4 className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4" /> Nova Categoria
              </h4>
              <input
                type="text"
                required
                placeholder="Nome da Categoria (Ex: Calças, Camisetas)"
                value={nomeCategoria}
                onChange={(e) => setNomeCategoria(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Descrição (Opcional)"
                value={descricaoCategoria}
                onChange={(e) => setDescricaoCategoria(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={salvandoCategoria}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition disabled:opacity-50"
              >
                {salvandoCategoria ? 'Salvando...' : 'Adicionar Categoria'}
              </button>
            </form>

            {/* Listagem de Categorias */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {categorias.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">Nenhuma categoria cadastrada.</p>
              ) : (
                categorias.map((cat) => (
                  <div key={cat.idCategoria} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{cat.nome}</p>
                      {cat.descricao && <p className="text-xs text-slate-400">{cat.descricao}</p>}
                    </div>
                    <button
                      onClick={() => excluirCategoria(cat.idCategoria)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR/EDITAR PRODUTO */}
      {modalProdutoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-xl font-bold text-white">
                {produtoEditandoId ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={fecharModalProduto} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarProduto} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Camiseta Algodão Premium"
                  value={nomeProduto}
                  onChange={(e) => setNomeProduto(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Preço Base (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={precoBase}
                  onChange={(e) => setPrecoBase(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Categoria *</label>
                <select
                  required
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Selecione a Categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={fecharModalProduto}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-sm transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMAÇÃO DE ESTORNO */}
      <ConfirmacaoModal
        visivel={!!vendaParaCancelar}
        tipo="danger"
        titulo="Estornar Venda"
        mensagem={`Confirmar o cancelamento da Venda #${vendaParaCancelar?.idvendas}?`}
        comInputTexto={true}
        labelInput="Motivo do Estorno *"
        valorInput={motivoCancelamento}
        aoMudarInput={setMotivoCancelamento}
        carregando={processandoCancelamento}
        aoConfirmar={confirmarEstornoVenda}
        aoCancelar={() => setVendaParaCancelar(null)}
      />

      {/* FEEDBACK MODAL */}
      <FeedbackModal
        visivel={modalFeedback.visivel}
        tipo={modalFeedback.tipo}
        titulo={modalFeedback.titulo}
        mensagem={modalFeedback.mensagem}
        aoFechar={() => setModalFeedback({ ...modalFeedback, visivel: false })}
      />
    </div>
  );
}