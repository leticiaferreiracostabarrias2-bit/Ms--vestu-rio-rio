import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { type Cliente, type VarianteSku, type ItemCarrinho, type FormaPagamento, type Categoria } from '../../types';
import { FeedbackModal } from '../FeedbackModal';
import { ShoppingCart, Search, UserPlus, Trash2, X, Plus, Minus, Tag, Filter } from 'lucide-react';

export function PDV() {
  // Dados do sistema
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [variantes, setVariantes] = useState<VarianteSku[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Estados da Venda / Checkout
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<number | ''>('');
  const [skuBusca, setSkuBusca] = useState('');
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<number | ''>('');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('DINHEIRO');
  const [desconto, setDesconto] = useState<number>(0);
  const [gerenteId, setGerenteId] = useState<string>('');

  // Estados para Cadastro Rápido de Cliente no Balcão
  const [mostrarModalNovoCliente, setMostrarModalNovoCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteCpf, setNovoClienteCpf] = useState('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState('');
  const [novoClienteEmail, setNovoClienteEmail] = useState('');
  const [salvandoCliente, setSalvandoCliente] = useState(false);

  // Estados de controle e feedback
  const [carregandoVenda, setCarregandoVenda] = useState(false);
  const [carregandoEstoque, setCarregandoEstoque] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ visivel: boolean; tipo: 'sucesso' | 'erro'; titulo: string; mensagem: string }>({
    visivel: false,
    tipo: 'sucesso',
    titulo: '',
    mensagem: ''
  });

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      const [resClientes, resVariantes, resCategorias] = await Promise.all([
        api.get('/clientes'),
        api.get('/variantes'),
        api.get('/categorias')
      ]);
      setClientes(resClientes.data);
      setVariantes(resVariantes.data);
      setCategorias(resCategorias.data);
    } catch (erro) {
      console.error('Erro ao carregar dados do caixa:', erro);
    }
  };

  // Alterar Categoria no Select chamando a Rota Protegida do Backend
  const handleMudarCategoria = async (idCat: number | '') => {
    setCategoriaSelecionadaId(idCat);
    setCarregandoEstoque(true);
    try {
      if (idCat === '') {
        const res = await api.get('/variantes');
        setVariantes(res.data);
      } else {
        const res = await api.get(`/variantes/categoria/${idCat}`);
        setVariantes(res.data);
      }
    } catch (erro) {
      console.error('Erro ao filtrar por categoria:', erro);
    } finally {
      setCarregandoEstoque(false);
    }
  };

  // Cadastrar Cliente diretamente no Caixa
  const handleCadastrarClienteRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClienteNome.trim()) return;

    setSalvandoCliente(true);
    try {
      const res = await api.post('/clientes', {
        nome: novoClienteNome.trim(),
        cpfCnpj: novoClienteCpf.trim() || undefined,
        telefone: novoClienteTelefone.trim() || undefined,
        email: novoClienteEmail.trim() || undefined
      });

      const resClientes = await api.get('/clientes');
      setClientes(resClientes.data);
      setClienteSelecionadoId(res.data.idCliente);

      setMostrarModalNovoCliente(false);
      setNovoClienteNome('');
      setNovoClienteCpf('');
      setNovoClienteTelefone('');
      setNovoClienteEmail('');

      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Cliente Cadastrado!',
        mensagem: 'Cliente cadastrado com sucesso e vinculado a esta venda.'
      });
    } catch (erro: any) {
      const msg = erro.response?.data?.mensagem || 'Erro ao cadastrar cliente.';
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Falha no Cadastro',
        mensagem: msg
      });
    } finally {
      setSalvandoCliente(false);
    }
  };

  // Adicionar Item ao Carrinho
  const adicionarAoCarrinho = (variante: VarianteSku) => {
    if (variante.quantidadeEstoque <= 0) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Sem Estoque',
        mensagem: `A peça SKU ${variante.sku} está com estoque esgotado.`
      });
      return;
    }

    const itemExistente = carrinho.find(item => item.varianteSkuId === variante.idVarianteSku);

    if (itemExistente) {
      if (itemExistente.quantidade + 1 > variante.quantidadeEstoque) {
        setModalFeedback({
          visivel: true,
          tipo: 'erro',
          titulo: 'Estoque Máximo',
          mensagem: `A quantidade máxima disponível para esta peça é ${variante.quantidadeEstoque} unidade(s).`
        });
        return;
      }

      setCarrinho(carrinho.map(item =>
        item.varianteSkuId === variante.idVarianteSku
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.precoUnitario }
          : item
      ));
    } else {
      setCarrinho([
        ...carrinho,
        {
          varianteSkuId: variante.idVarianteSku,
          sku: variante.sku,
          nomeProduto: variante.nomeProduto || 'Peça Vestuário',
          tamanho: variante.tamanho,
          cor: variante.cor,
          precoUnitario: Number(variante.precoVenda),
          quantidade: 1,
          subtotal: Number(variante.precoVenda)
        }
      ]);
    }
  };

  // Alterar Quantidade
  const alterarQuantidade = (varianteSkuId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      setCarrinho(carrinho.filter(item => item.varianteSkuId !== varianteSkuId));
      return;
    }

    const varianteOriginal = variantes.find(v => v.idVarianteSku === varianteSkuId);
    if (varianteOriginal && novaQuantidade > varianteOriginal.quantidadeEstoque) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Estoque Insuficiente',
        mensagem: `Estoque disponível no momento: ${varianteOriginal.quantidadeEstoque} unidade(s).`
      });
      return;
    }

    setCarrinho(carrinho.map(item =>
      item.varianteSkuId === varianteSkuId
        ? { ...item, quantidade: novaQuantidade, subtotal: novaQuantidade * item.precoUnitario }
        : item
    ));
  };

  // Cálculos do Checkout
  const subtotalTotal = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const percentualDesconto = subtotalTotal > 0 ? (desconto / subtotalTotal) * 100 : 0;
  const exigeAutorizacaoGerente = percentualDesconto > 10;
  const valorTotalFinal = Math.max(0, subtotalTotal - desconto);

  const getNomeCategoriaVariante = (v: VarianteSku) =>
    (v as VarianteSku & { nomeCategoria?: string }).nomeCategoria || '';

  // Filtro de Busca por Texto de SKUs / Produtos
  const variantesFiltradas = variantes.filter(v => {
    const termo = skuBusca.toLowerCase();
    const nomeCategoria = getNomeCategoriaVariante(v);

    return (
      v.sku.toLowerCase().includes(termo) ||
      (v.nomeProduto && v.nomeProduto.toLowerCase().includes(termo)) ||
      (nomeCategoria && nomeCategoria.toLowerCase().includes(termo)) ||
      v.cor.toLowerCase().includes(termo) ||
      v.tamanho.toLowerCase().includes(termo)
    );
  });

  // Registrar a Venda
  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Carrinho Vazio',
        mensagem: 'Adicione pelo menos uma peça ao carrinho para realizar o checkout.'
      });
      return;
    }

    if (exigeAutorizacaoGerente && !gerenteId.trim()) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Autorização do Gerente Necessária',
        mensagem: 'Descontos acima de 10% exigem a identificação de um Gerente.'
      });
      return;
    }

    setCarregandoVenda(true);

    try {
      // Tenta resgatar os dados do operador logado do localStorage para garantir o usuarioId
      const usuarioSalvo = localStorage.getItem('usuario');
      const usuarioObj = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
      const usuarioId = usuarioObj?.id || usuarioObj?.idUsuario || usuarioObj?.id_usuario;

      const payload = {
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
        clienteId: clienteSelecionadoId ? Number(clienteSelecionadoId) : undefined,
        formaPagamento,
        desconto: Number(desconto),
        gerenteAutorizouId: exigeAutorizacaoGerente ? Number(gerenteId) : undefined,
        itens: carrinho.map(item => ({
          varianteSkuId: item.varianteSkuId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario
        }))
      };

      const resposta = await api.post('/vendas', payload);

      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Venda Realizada com Sucesso!',
        mensagem: `Venda #${resposta.data.idVenda} concluída. Valor Total: R$ ${resposta.data.valorTotal.toFixed(2)}`
      });

      setCarrinho([]);
      setDesconto(0);
      setGerenteId('');
      setClienteSelecionadoId('');
      carregarDadosIniciais();

    } catch (erro: any) {
      const msg = erro.response?.data?.mensagem || 'Falha ao processar venda no caixa.';
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro ao Processar',
        mensagem: msg
      });
    } finally {
      setCarregandoVenda(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* CABEÇALHO DO CAIXA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-cyan-400" />
            Caixa / PDV de Vestuário
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Consulta rápida de estoque de peças, vinculação de cliente e registro de vendas
          </p>
        </div>

        {/* Vínculo e Cadastro de Cliente */}
        <div className="w-full md:w-80 space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase text-slate-300">
              Cliente da Venda
            </label>
            <button
              onClick={() => setMostrarModalNovoCliente(true)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Cadastrar Cliente
            </button>
          </div>
          <select
            value={clienteSelecionadoId}
            onChange={(e) => setClienteSelecionadoId(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="">Cliente Não Identificado (Balcão)</option>
            {clientes.map(c => (
              <option key={c.idCliente} value={c.idCliente}>
                {c.nome} {c.cpfCnpj ? `(${c.cpfCnpj})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ÁREA DE CONSULTA DE ESTOQUE */}
        <div className="lg:col-span-7 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Estoque de Produtos</h2>
              <span className="text-xs text-slate-400">Clique na peça para adicionar ao carrinho</span>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              {variantesFiltradas.length} SKU(s)
            </span>
          </div>

          {/* BARRA DE FILTROS: SELECT DE CATEGORIA + CAMPO DE PESQUISA */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Filter className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <select
                value={categoriaSelecionadaId}
                onChange={(e) => handleMudarCategoria(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="">Todas as Categorias</option>
                {categorias.map(cat => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Pesquisar SKU, peça, cor ou tamanho..."
                value={skuBusca}
                onChange={(e) => setSkuBusca(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 p-3 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Grade do Estoque */}
          {carregandoEstoque ? (
            <div className="text-center py-12 text-slate-400 text-sm">Carregando itens...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {variantesFiltradas.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-slate-500 text-sm">
                  Nenhuma peça encontrada para os filtros selecionados.
                </div>
              ) : (
                variantesFiltradas.map((v) => {
                  const nomeCategoria = getNomeCategoriaVariante(v);

                  return (
                    <div
                      key={v.idVarianteSku}
                      onClick={() => adicionarAoCarrinho(v)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        v.quantidadeEstoque > 0
                          ? 'bg-slate-900/80 border-slate-700 hover:border-cyan-500 hover:bg-slate-900'
                          : 'bg-slate-900/30 border-red-500/30 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {v.sku}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            v.quantidadeEstoque > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {v.quantidadeEstoque > 0 ? `Estoque: ${v.quantidadeEstoque} un.` : 'Sem Estoque'}
                          </span>
                        </div>

                        <h3 className="text-white font-bold text-sm line-clamp-1">{v.nomeProduto || 'Peça Vestuário'}</h3>

                        {/* Exibição da Categoria do Produto */}
                        {nomeCategoria && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md mt-1">
                            <Tag className="w-3 h-3 text-cyan-400" />
                            {nomeCategoria}
                          </span>
                        )}

                        <p className="text-slate-400 text-xs mt-1">
                          Tamanho: <strong className="text-slate-200">{v.tamanho}</strong> | Cor: <strong className="text-slate-200">{v.cor}</strong>
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
                        <span className="text-xs text-slate-400">Preço Tabela</span>
                        <span className="text-lg font-black text-emerald-400">
                          R$ {Number(v.precoVenda).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ÁREA DA VENDA E CHECKOUT */}
        <div className="lg:col-span-5 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h2 className="text-lg font-bold text-white">Carrinho do Caixa</h2>
              <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                {carrinho.reduce((acc, item) => acc + item.quantidade, 0)} peça(s)
              </span>
            </div>

            {/* Lista dos Itens do Carrinho */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {carrinho.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  Nenhum item selecionado. Clique nas peças do estoque ao lado para vender.
                </div>
              ) : (
                carrinho.map((item) => (
                  <div key={item.varianteSkuId} className="bg-slate-900 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-bold truncate">{item.nomeProduto}</h4>
                      <p className="text-xs text-slate-400">
                        {item.sku} | {item.tamanho} | {item.cor}
                      </p>
                      <span className="text-xs text-emerald-400 font-semibold">
                        R$ {item.precoUnitario.toFixed(2)} un.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alterarQuantidade(item.varianteSkuId, item.quantidade - 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-white font-bold text-sm w-5 text-center">{item.quantidade}</span>
                      <button
                        onClick={() => alterarQuantidade(item.varianteSkuId, item.quantidade + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alterarQuantidade(item.varianteSkuId, 0)}
                        className="p-1 text-slate-400 hover:text-red-400 transition ml-1"
                        title="Remover Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FECHAMENTO FINANCEIRO DA VENDA */}
          <div className="space-y-4 border-t border-slate-700 pt-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Forma de Pagamento</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="DINHEIRO">Dinheiro</option>
                <option value="PIX">Pix</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="VALE_TROCA">Vale Troca</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Desconto (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={desconto}
                  onChange={(e) => setDesconto(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              {exigeAutorizacaoGerente && (
                <div>
                  <label className="block text-xs font-bold uppercase text-amber-400 mb-1">ID Gerente (&gt;10%) *</label>
                  <input
                    type="text"
                    placeholder="ID Gerente"
                    value={gerenteId}
                    onChange={(e) => setGerenteId(e.target.value)}
                    className="w-full bg-amber-950/40 border border-amber-500/50 text-amber-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-4 rounded-xl space-y-2 border border-slate-700">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal:</span>
                <span>R$ {subtotalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-400">
                <span>Desconto ({percentualDesconto.toFixed(1)}%):</span>
                <span>R$ {desconto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-white border-t border-slate-800 pt-2">
                <span>Total a Pagar:</span>
                <span className="text-emerald-400">R$ {valorTotalFinal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={finalizarVenda}
              disabled={carregandoVenda || carrinho.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-900/30"
            >
              {carregandoVenda ? 'Concluindo Venda...' : 'Finalizar Venda no Caixa'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL PARA CADASTRO RÁPIDO DE CLIENTE */}
      {mostrarModalNovoCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                Cadastrar Cliente no Caixa
              </h3>
              <button 
                onClick={() => setMostrarModalNovoCliente(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarClienteRapido} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={novoClienteNome}
                  onChange={(e) => setNovoClienteNome(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={novoClienteCpf}
                  onChange={(e) => setNovoClienteCpf(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={novoClienteTelefone}
                  onChange={(e) => setNovoClienteTelefone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={novoClienteEmail}
                  onChange={(e) => setNovoClienteEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalNovoCliente(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoCliente || !novoClienteNome.trim()}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-sm transition"
                >
                  {salvandoCliente ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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