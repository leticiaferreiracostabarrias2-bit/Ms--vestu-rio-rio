//Esta página atende ao requisito de análise de desempenho da loja:
//Curva ABC / Produtos Mais Vendidos: Consome o endpoint GET /vendas/relatorios/mais-vendidos (restrito a GERENTE e ADMIN).
//Métricas Visuais: Exibe o total de unidades vendidas e o faturamento total por peça/SKU, com filtro dinâmico de quantidade de itens exibidos.

import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { type RelatorioCurvaABC } from '../../types';
import { BarChart3, AlertTriangle } from 'lucide-react';

export function Relatorios() {
  const [relatorio, setRelatorio] = useState<RelatorioCurvaABC[]>([]);
  const [limite, setLimite] = useState<number>(10);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarRelatorio();
  }, [limite]);

  const carregarRelatorio = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await api.get(`/vendas/relatorios/mais-vendidos?limite=${limite}`);
      setRelatorio(resposta.data);
    } catch (err: any) {
      const msg = err.response?.data?.mensagem || 'Erro ao carregar o relatório. Verifique se o seu perfil é GERENTE ou ADMIN.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  const totalFaturadoGeral = relatorio.reduce((acc, item) => acc + Number(item.faturamentoTotal), 0);
  const totalUnidadesGeral = relatorio.reduce((acc, item) => acc + Number(item.totalUnidadesVendidas), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* TÍTULO E CONTROLES DA PÁGINA */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Relatório Curva ABC / Mais Vendidos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Análise de saída de peças de vestuário e faturamento total por SKU
          </p>
        </div>

        {/* Seleção do Limite do Top */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-slate-300 whitespace-nowrap">
            Exibir Top:
          </label>
          <select
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value={5}>Top 5 Peças</option>
            <option value={10}>Top 10 Peças</option>
            <option value={20}>Top 20 Peças</option>
            <option value={50}>Top 50 Peças</option>
          </select>
        </div>
      </div>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* RESUMO EM CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total de Peças Vendidas ({limite} itens)
          </span>
          <p className="text-2xl font-black text-cyan-400">
            {totalUnidadesGeral} unidades
          </p>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Faturamento do Período ({limite} itens)
          </span>
          <p className="text-2xl font-black text-emerald-400">
            R$ {totalFaturadoGeral.toFixed(2)}
          </p>
        </div>
      </div>

      {/* TABELA CURVA ABC */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-slate-400 text-sm">Gerando relatório...</div>
        ) : relatorio.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">Nenhum registro de venda concluída encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700 text-xs font-bold uppercase text-slate-400">
                  <th className="p-4">Posição</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Tamanho / Cor</th>
                  <th className="p-4 text-center">Unidades Vendidas</th>
                  <th className="p-4 text-right">Faturamento Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm text-slate-300">
                {relatorio.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-700/30 transition">
                    <td className="p-4 font-bold text-slate-400">
                      <span className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-black text-xs ${
                        index === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : index === 1
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                          : index === 2
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                          : 'bg-slate-900 text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{item.nomeProduto}</td>
                    <td className="p-4 font-mono font-bold text-cyan-400">{item.sku}</td>
                    <td className="p-4 text-xs">
                      {item.tamanho} / {item.cor}
                    </td>
                    <td className="p-4 text-center font-bold text-white">
                      {item.totalUnidadesVendidas}
                    </td>
                    <td className="p-4 text-right font-black text-emerald-400">
                      R$ {Number(item.faturamentoTotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}