import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type TipoModalConfirmacao = 'danger' | 'warning' | 'info';

export interface ConfirmacaoModalProps {
  visivel?: boolean;
  isOpen?: boolean; // Compatibilidade com chamadas antigas
  titulo?: string;
  mensagem?: string;
  detalhe?: string;
  tipo?: TipoModalConfirmacao;
  aoConfirmar?: () => void;
  onConfirm?: () => void; // Compatibilidade
  aoCancelar?: () => void;
  onClose?: () => void; // Compatibilidade
  carregando?: boolean;
  isLoading?: boolean; // Compatibilidade
  textoConfirmar?: string;
  textoCancelar?: string;
  textoCarregando?: string;
  // Propriedades para entrada de texto (ex: motivo do cancelamento/estorno)
  comInputTexto?: boolean;
  placeholderInput?: string;
  valorInput?: string;
  aoMudarInput?: (valor: string) => void;
  labelInput?: string;
}

export function ConfirmacaoModal({
  visivel,
  isOpen,
  titulo = "Confirmar Ação",
  mensagem = "Tem certeza que deseja executar esta ação? Esta operação não poderá ser desfeita.",
  detalhe,
  tipo = 'danger',
  aoConfirmar,
  onConfirm,
  aoCancelar,
  onClose,
  carregando = false,
  isLoading = false,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  textoCarregando = "Processando...",
  comInputTexto = false,
  placeholderInput = "Digite aqui...",
  valorInput = "",
  aoMudarInput,
  labelInput
}: ConfirmacaoModalProps) {
  // Suporta tanto 'visivel' quanto 'isOpen'
  const estaAberto = visivel !== undefined ? visivel : !!isOpen;
  if (!estaAberto) return null;

  const estaCarregando = carregando || isLoading;
  const executarConfirmar = aoConfirmar || onConfirm || (() => {});
  const executarCancelar = aoCancelar || onClose || (() => {});

  // Estilos dinâmicos de acordo com o tipo da ação
  const configuracoesTipo = {
    danger: {
      corIconeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
      corBotaoConfirmar: 'bg-red-600 hover:bg-red-500 shadow-red-900/30',
      icone: <AlertTriangle className="w-8 h-8" />
    },
    warning: {
      corIconeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      corBotaoConfirmar: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30',
      icone: <AlertCircle className="w-8 h-8" />
    },
    info: {
      corIconeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      corBotaoConfirmar: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30',
      icone: <Info className="w-8 h-8" />
    }
  }[tipo];

  const desabilitarConfirmar = estaCarregando || (comInputTexto && !valorInput.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform transition-all">
        {/* Ícone */}
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 border ${configuracoesTipo.corIconeBg}`}>
          {configuracoesTipo.icone}
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-white mb-2">
          {titulo}
        </h3>

        {/* Mensagem */}
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
          {mensagem}
        </p>

        {/* Detalhe adicional */}
        {detalhe && (
          <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3 mb-4 text-left text-xs text-slate-300">
            <span className="text-slate-400 font-semibold block mb-0.5">Detalhe:</span>
            {detalhe}
          </div>
        )}

        {/* Campo de texto (usado no cancelamento para exigir motivo) */}
        {comInputTexto && (
          <div className="mb-6 text-left">
            {labelInput && (
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {labelInput}
              </label>
            )}
            <textarea
              rows={3}
              value={valorInput}
              onChange={(e) => aoMudarInput && aoMudarInput(e.target.value)}
              placeholder={placeholderInput}
              disabled={estaCarregando}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none"
            />
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={executarCancelar}
            disabled={estaCarregando}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 transition disabled:opacity-50"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={executarConfirmar}
            disabled={desabilitarConfirmar}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-white transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${configuracoesTipo.corBotaoConfirmar}`}
          >
            {estaCarregando ? textoCarregando : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmacaoModal;