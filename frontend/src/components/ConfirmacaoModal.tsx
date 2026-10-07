interface ConfirmacaoModalProps {
    visivel: boolean;
    titulo?: string;
    mensagem?: string;
    detalhe?: string;
    aoConfirmar: () => void;
    aoCancelar: () => void;
    carregando?: boolean;
    textoConfirmar?: string;
    textoCarregando?: string;
}

export function ConfirmacaoModal({
    visivel,
    titulo = "Confirmar Ação",
    mensagem = "Tem certeza que deseja executar esta ação? Esta operação não poderá ser desfeita.",
    detalhe,
    aoConfirmar,
    aoCancelar,
    carregando = false,
    textoConfirmar = "Confirmar",
    textoCarregando = "Processando..."
}: ConfirmacaoModalProps) {
    if (!visivel) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform transition-all">
                <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                    {titulo}
                </h3>

                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    {mensagem}
                </p>

                {detalhe && (
                    <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3 mb-6 text-left text-xs text-slate-300">
                        <span className="text-slate-400 font-semibold block mb-0.5">Item selecionado:</span>
                        {detalhe}
                    </div>
                )}

                <div className="flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={aoCancelar}
                        disabled={carregando}
                        className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={aoConfirmar}
                        disabled={carregando}
                        className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-500 transition shadow-lg shadow-red-900/30 disabled:opacity-50"
                    >
                        {carregando ? textoCarregando : textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}

