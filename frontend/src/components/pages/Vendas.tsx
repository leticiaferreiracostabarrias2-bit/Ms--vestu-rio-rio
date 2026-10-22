import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ConfirmacaoModal } from '../ConfirmacaoModal';
import { FeedbackModal } from '../FeedbackModal';
import { Receipt, Search, Eye, Ban, X } from 'lucide-react';

type StatusVenda = 'CONCLUIDA' | 'CANCELADA';
type TipoFeedback = 'sucesso' | 'erro';

interface VendaResumo {
  idvendas: number;
  data_venda: string;
  valor_total: number;
  desconto: number;
  forma_pagamento: string;
  status: StatusVenda;
  vendedor: string;
  cliente: string | null;
}

interface ItemVendaDetalhe {
  idItemVenda: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  sku: string;
  nomeProduto: string;
  tamanho: string;
  cor: string;
}

interface VendaDetalhada {
  dados: VendaResumo;
  itens: ItemVendaDetalhe[];
}

interface FeedbackModalState {
  visivel: boolean;
  tipo: TipoFeedback;
  titulo: string;
  mensagem: string;
}

interface RespostaItensVenda {
  itens?: ItemVendaDetalhe[];
}

export function Vendas() {
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [carregandoLista, setCarregandoLista] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');

  // Estados para o Modal de Detalhes da Venda
  const [vendaDetalhada, setVendaDetalhada] = useState<VendaDetalhada | null>(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState<boolean>(false);

  // Estados para o Modal de Cancelamento/Estorno
  const [vendaParaCancelar, setVendaParaCancelar] = useState<VendaResumo | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState<string>('');
  const [processandoCancelamento, setProcessandoCancelamento] = useState<boolean>(false);

  // Modal de Feedback
  const [modalFeedback, setModalFeedback] = useState<FeedbackModalState>({
    visivel: false,
    tipo: 'sucesso',
    titulo: '',
    mensagem: ''
  });

  useEffect(() => {
    carregarVendas();
  }, []);

  const carregarVendas = async (): Promise<void> => {
    setCarregandoLista(true);
    try {
      const resposta = await api.get<VendaResumo[]>('/vendas');
      setVendas(resposta.data);
    } catch (erro) {
      console.error('Erro ao carregar histórico de vendas:', erro);
    } finally {
      setCarregandoLista(false);
    }
  };

  const abrirDetalhesVenda = async (venda: VendaResumo): Promise<void> => {
    setCarregandoDetalhes(true);
    try {
      const resposta = await api.get<RespostaItensVenda>(`/vendas/${venda.idvendas}`);
      setVendaDetalhada({
        dados: venda,
        itens: resposta.data.itens || []
      });
    } catch (erro) {
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Erro ao Carregar',
        mensagem: 'Não foi possível buscar os itens pertencentes a esta venda.'
      });
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  const confirmarEstornoVenda = async (): Promise<void> => {
    if (!vendaParaCancelar || !motivoCancelamento.trim()) return;

    setProcessandoCancelamento(true);
    try {
      await api.patch(`/vendas/${vendaParaCancelar.idvendas}/cancelar`, {
        motivo: motivoCancelamento.trim()
      });

      setModalFeedback({
        visivel: true,
        tipo: 'sucesso',
        titulo: 'Venda Cancelada!',
        mensagem: `A Venda #${vendaParaCancelar.idvendas} foi cancelada e os itens foram estornados de volta ao estoque.`
      });

      setVendaParaCancelar(null);
      setMotivoCancelamento('');
      carregarVendas();
    } catch (erro: any) {
      const msg = erro.response?.data?.mensagem || 'Falha ao cancelar a venda. Verifique se possui perfil GERENTE ou ADMIN.';
      setModalFeedback({
        visivel: true,
        tipo: 'erro',
        titulo: 'Acesso Negado ou Erro',
        mensagem: msg
      });
    } finally {
      setProcessandoCancelamento(false);
    }
  };

  // Filtragem simples e geral apenas pelo campo de pesquisa
  const vendasFiltradas = vendas.filter((v) => {
    const termo = busca.toLowerCase();
    return (
      String(v.idvendas).includes(termo) ||
      v.vendedor.toLowerCase().includes(termo) ||
      (v.cliente && v.cliente.toLowerCase().includes(termo)) ||
      v.forma_pagamento.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* TÍTULO DA PÁGINA E PESQUISA GERAL */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Receipt className="w-8 h-8 text-cyan-400" />
            Histórico de Vendas & Estornos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Consulta de vendas efetuadas e estorno/cancelamento com devolução automática ao estoque
          </p>
        </div>

        {/* CAMPO DE PESQUISA GERAL */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filtrar por nº venda, vendedor, cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 w-full"
          />
        </div>
      </div>

      {/* TABELA DE VENDAS */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        {carregandoLista ? (
          <div className="p-8 text-center text-slate-400 text-sm">Carregando vendas...</div>
        ) : vendasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">Nenhuma venda encontrada.</div>
        ) : (
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
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm text-slate-300">
                {vendasFiltradas.map((v) => (
                  <tr key={v.idvendas} className="hover:bg-slate-700/30 transition">
                    <td className="p-4 font-mono font-bold text-cyan-400">#{v.idvendas}</td>
                    <td className="p-4 text-xs">{new Date(v.data_venda).toLocaleString('pt-BR')}</td>
                    <td className="p-4 font-semibold text-white">{v.vendedor}</td>
                    <td className="p-4">{v.cliente || <span className="text-slate-500 italic">Balcão</span>}</td>
                    <td className="p-4 text-xs font-bold text-slate-400">{v.forma_pagamento}</td>
                    <td className="p-4 font-bold text-emerald-400">R$ {Number(v.valor_total).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        v.status === 'CONCLUIDA'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => abrirDetalhesVenda(v)}
                        className="bg-slate-700 hover:bg-slate-600 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Itens
                      </button>

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
        )}
      </div>

      {/* MODAL DE DETALHES DOS ITENS DA VENDA */}
      {(vendaDetalhada || carregandoDetalhes) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
            {carregandoDetalhes ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white">Carregando itens da venda...</h3>
                <p className="text-sm text-slate-400 mt-2">Aguarde enquanto buscamos os produtos desta venda.</p>
              </div>
            ) : vendaDetalhada && (
              <>
                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Comprovante / Itens da Venda #{vendaDetalhada.dados.idvendas}</h3>
                    <p className="text-xs text-slate-400">Vendedor: {vendaDetalhada.dados.vendedor} | Cliente: {vendaDetalhada.dados.cliente || 'Balcão'}</p>
                  </div>
                  <button onClick={() => setVendaDetalhada(null)} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {vendaDetalhada.itens.map((item) => (
                    <div key={item.idItemVenda} className="bg-slate-900 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <span className="font-bold text-white text-sm block">{item.nomeProduto}</span>
                        <span className="text-slate-400">SKU: {item.sku} | Tam: {item.tamanho} | Cor: {item.cor}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-emerald-400 text-sm">R$ {Number(item.subtotal).toFixed(2)}</span>
                        <span className="text-slate-400">{item.quantidade}x R$ {Number(item.precoUnitario).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-700 pt-3 flex justify-between items-center text-sm">
                  <span className="text-slate-400">Desconto Concedido: <strong className="text-amber-400">R$ {Number(vendaDetalhada.dados.desconto).toFixed(2)}</strong></span>
                  <button onClick={() => setVendaDetalhada(null)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-5 rounded-xl transition">
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO COM MOTIVO */}
      <ConfirmacaoModal
        visivel={!!vendaParaCancelar}
        tipo="danger"
        titulo="Cancelar e Estornar Venda"
        mensagem={`Tem certeza que deseja cancelar a Venda #${vendaParaCancelar?.idvendas}? Todas as peças serão devolvidas automaticamente ao estoque.`}
        detalhe={`Valor Total a ser estornado: R$ ${Number(vendaParaCancelar?.valor_total || 0).toFixed(2)}`}
        comInputTexto={true}
        labelInput="Motivo do Cancelamento / Estorno *"
        placeholderInput="Informe o motivo obrigatório (ex: Troca de produto, erro no valor, desistência)"
        valorInput={motivoCancelamento}
        aoMudarInput={setMotivoCancelamento}
        textoConfirmar="Confirmar Estorno"
        textoCarregando="Estornando estoque..."
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