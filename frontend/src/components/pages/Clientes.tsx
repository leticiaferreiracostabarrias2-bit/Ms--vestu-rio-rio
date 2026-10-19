//Esta página atende a dois requisitos fundamentais do sistema:
//Cadastro e Listagem de Clientes: Permitir o cadastro rápido (sem senha, conforme definimos) e a consulta dos clientes da loja.
//Histórico Detalhado de Compras: Ao selecionar ou clicar em um cliente, exibe todas as peças e compras que ele já realizou no PDV (consumindo o endpoint GET /vendas/cliente/:clienteId que criamos no backend).

import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { type Cliente, type HistoricoCompraCliente } from '../../types';
import { FeedbackModal } from '../FeedbackModal';
import { Users, UserPlus, ShoppingBag, X, Search } from 'lucide-react';

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  
  // Campos para novo cliente
  const [nome, setNome] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  // Estados do Histórico do Cliente
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [historicoCompras, setHistoricoCompras] = useState<HistoricoCompraCliente[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Controle de interface
  const [carregando, setCarregando] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ visivel: boolean; tipo: 'sucesso' | 'erro'; titulo: string; mensagem: string }>({
    visivel: false,
    tipo: 'sucesso',
    titulo: '',
    mensagem: ''
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const resposta = await api.get('/clientes');
      setClientes(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar lista de clientes:', erro);
    }
  };

  const cadastrarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setCarregando(true);
    try {
      await api.post('/clientes', {
        nome: nome.trim(),
        cpfCnpj: cpfCnpj.trim() || undefined,
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined
      });

      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Cliente Cadastrado!',
        mensagem: 'O cliente foi salvo com sucesso e já pode ser vinculado às compras no caixa.'
      });

      setNome('');
      setCpfCnpj('');
      setTelefone('');
      setEmail('');
      carregarClientes();
    } catch (erro: any) {
      const msg = erro.response?.data?.mensagem || 'Falha ao cadastrar cliente.';
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro no Cadastro',
        mensagem: msg
      });
    } finally {
      setCarregando(false);
    }
  };

  const verHistoricoCompras = async (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setCarregandoHistorico(true);
    try {
      const resposta = await api.get(`/vendas/cliente/${cliente.idCliente}`);
      setHistoricoCompras(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar histórico:', erro);
      setHistoricoCompras([]);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.cpfCnpj && c.cpfCnpj.includes(busca)) ||
    (c.telefone && c.telefone.includes(busca))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* TÍTULO DA PÁGINA */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-400" />
          Gestão de Clientes
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Cadastro de clientes e consulta detalhada do histórico de compras e peças adquiridas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORMULÁRIO DE CADASTRO (4 Colunas) */}
        <div className="lg:col-span-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4 h-fit">
          <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            Novo Cliente
          </h2>

          <form onSubmit={cadastrarCliente} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Ana Souza"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">CPF / CNPJ</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={carregando || !nome.trim()}
              className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 px-4 rounded-xl transition shadow-lg shadow-cyan-500/20"
            >
              {carregando ? 'Salvando...' : 'Cadastrar Cliente'}
            </button>
          </form>
        </div>

        {/* LISTA DE CLIENTES (8 Colunas) */}
        <div className="lg:col-span-8 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
            <h2 className="text-lg font-bold text-white">Clientes Cadastrados</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {clientesFiltrados.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-sm">Nenhum cliente encontrado.</p>
            ) : (
              clientesFiltrados.map((c) => (
                <div
                  key={c.idCliente}
                  className="bg-slate-900 p-4 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-500/50 transition"
                >
                  <div>
                    <h3 className="text-white font-bold text-base">{c.nome}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                      <span>CPF/CNPJ: <strong className="text-slate-300">{c.cpfCnpj || 'Não informado'}</strong></span>
                      <span>Tel: <strong className="text-slate-300">{c.telefone || 'Não informado'}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => verHistoricoCompras(c)}
                    className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition self-start sm:self-center flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Ver Compras
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL / PAINEL DO HISTÓRICO DE COMPRAS DO CLIENTE */}
      {clienteSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white">Histórico de Compras</h3>
                <p className="text-xs text-cyan-400 font-semibold">{clienteSelecionado.nome}</p>
              </div>
              <button
                onClick={() => setClienteSelecionado(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {carregandoHistorico ? (
                <p className="text-center py-8 text-slate-400 text-sm">Carregando histórico de peças...</p>
              ) : historicoCompras.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm">Este cliente ainda não realizou compras registradas no sistema.</p>
              ) : (
                historicoCompras.map((item, index) => (
                  <div key={index} className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                    <div>
                      <span className="font-bold text-white text-sm block">{item.nomeProduto}</span>
                      <span className="text-slate-400">SKU: {item.sku} | Tam: {item.tamanho} | Cor: {item.cor}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Venda #{item.vendaId} • {new Date(item.dataVenda).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block font-bold text-emerald-400 text-sm">R$ {Number(item.subtotalItem).toFixed(2)}</span>
                      <span className="text-slate-400">{item.quantidade}x R$ {Number(item.precoUnitario).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-700 pt-3 flex justify-end">
              <button
                onClick={() => setClienteSelecionado(null)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-5 rounded-xl text-sm transition"
              >
                Fechar
              </button>
            </div>
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